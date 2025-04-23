import {
  Animation,
  Color3,
  Color4,
  CubicEase,
  EasingFunction,
  PBRMaterial,
  GlowLayer,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from 'babylonjs';

import {
  GameSoundManager,
  createParticleTexture,
  gameToSceneSize,
  getPowerUpIconPath,
} from '@game/utils';

import {
  Player,
  PowerUpType,
  defaultGameObjectParams,
  defaultGameParams,
  playerPowerUp,
} from '@shared/types';

interface ActivePowerUpDisplay {
  id: string;
  powerUpType: PowerUpType;
  iconMesh: Mesh;
  tubeMesh: Mesh;
  torusMesh: Mesh;
  particleSystem: ParticleSystem;
  timeToExpire: number;
  initialTime: number;
  position: Vector3;
  player: 'player1' | 'player2';
  index: number;
}

export class ActivePowerUpIconManager {
  private scene: Scene;
  private activeDisplays: Map<string, ActivePowerUpDisplay> = new Map();
  private primaryColor: Color3;
  private secondaryColor: Color3;
  private soundManager?: GameSoundManager;
  private gameWidth: number;
  private iconSize: number = 4.0;
  private ySpacing: number;
  private circleSize: number;
  private tubeRadius: number = 0.05;
  private numSegments: number = 64;
  private iconXOffset: number = 3.5;
  private iconYOffset: number = 9.0;

  constructor(
    scene: Scene,
    primaryColor: Color3,
    secondaryColor: Color3,
    soundManager?: GameSoundManager
  ) {
    this.scene = scene;
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
    this.soundManager = soundManager;
    this.gameWidth = gameToSceneSize(defaultGameParams.dimensions.gameWidth) / 2;
    this.ySpacing = this.iconSize * 1.5;
    this.circleSize = this.iconSize * 1.25;
  }

  updatePowerUpDisplays(players: { player1: Player; player2: Player }): void {
    this.updatePlayerPowerUps(players.player1, 'player1');
    this.updatePlayerPowerUps(players.player2, 'player2');

    this.activeDisplays.forEach((display) => {
      this.updateProgressRing(display);
    });
  }

  private updatePlayerPowerUps(player: Player, playerType: 'player1' | 'player2'): void {
    const currentPowerUpIds = new Set<string>();

    // Process current active power-ups
    player.activePowerUps.forEach((powerUp, index) => {
      const id = `${playerType}-${powerUp.type}-${index}`;
      currentPowerUpIds.add(id);

      if (!this.activeDisplays.has(id)) {
        // Create new display for this power-up
        this.createPowerUpDisplay(powerUp, playerType, index);
      } else {
        // Update existing display
        const display = this.activeDisplays.get(id)!;
        display.timeToExpire = powerUp.timeToExpire;
      }
    });

    // Check and remove expired displays
    const expiredDisplays: string[] = [];
    this.activeDisplays.forEach((display, id) => {
      if (display.player === playerType && !currentPowerUpIds.has(id)) {
        expiredDisplays.push(id);
      }
    });

    expiredDisplays.forEach((id, index) => {
      const display = this.activeDisplays.get(id);
      if (display && !display.tubeMesh.metadata?.disposing) {
        setTimeout(() => {
          this.disposeDisplayWithAnimation(id);
          // Use small stagger for multiple disposals
        }, index * 50);

        setTimeout(
          () => {
            // Schedule repositioning after animations
            this.repositionPlayerDisplays(playerType);
          },
          800 + expiredDisplays.length * 50
        );
      }
    });
  }

  private createPowerUpDisplay(
    powerUp: playerPowerUp,
    playerType: 'player1' | 'player2',
    index: number
  ): void {
    const isPlayer1 = playerType === 'player1';
    const id = `${playerType}-${powerUp.type}-${index}`;

    const xOffset = this.gameWidth + this.iconXOffset;
    const xPosition = isPlayer1 ? -xOffset : xOffset;
    const yPosition = this.iconYOffset - index * this.ySpacing;
    const zPosition = defaultGameObjectParams.distanceFromFloor;

    const effectColor = powerUp.isNegative ? this.secondaryColor : this.primaryColor;

    const iconPosition = new Vector3(xPosition, yPosition, zPosition);

    const iconMesh = this.createPowerUpIcon(powerUp.type, iconPosition, effectColor, id);
    const tubeMesh = this.createTubeRing(iconPosition, effectColor, id);
    const torusMesh = this.createTorusRing(iconPosition, effectColor, id);
    const particleSystem = this.createRingParticles(tubeMesh, effectColor, id);

    const display: ActivePowerUpDisplay = {
      id,
      powerUpType: powerUp.type,
      iconMesh: iconMesh,
      tubeMesh: tubeMesh,
      torusMesh: torusMesh,
      particleSystem: particleSystem,
      timeToExpire: powerUp.timeToExpire,
      initialTime: powerUp.timeToExpire,
      position: iconPosition,
      player: playerType,
      index,
    };

    this.activeDisplays.set(id, display);

    iconMesh.scaling = new Vector3(0, 0, 0);
    tubeMesh.scaling = new Vector3(0, 0, 0);
    torusMesh.scaling = new Vector3(0, 0, 0);

    particleSystem.emitRate = 0;

    const iconAnimations = this.createSpawnAnimations(iconMesh, effectColor, `icon-${id}`);
    const tubeAnimations = this.createSpawnAnimations(tubeMesh, effectColor, `tube-${id}`);
    const torusAnimations = this.createSpawnAnimations(torusMesh, effectColor, `torus-${id}`);

    iconMesh.animations = iconAnimations;
    tubeMesh.animations = tubeAnimations;
    torusMesh.animations = torusAnimations;

    const scene = iconMesh.getScene();

    scene.beginAnimation(iconMesh, 0, 30, false);
    scene.beginAnimation(tubeMesh, 0, 30, false);
    scene.beginAnimation(torusMesh, 0, 30, false, 1, () => {
      particleSystem.emitRate = 150;
      this.animateActiveDisplay(display);
    });
  }

  private createPowerUpIcon(
    powerUpType: PowerUpType,
    position: Vector3,
    effectColor: Color3,
    id: string
  ): Mesh {
    const icon = MeshBuilder.CreatePlane(
      `powerUpIcon-${id}`,
      { width: this.iconSize, height: this.iconSize },
      this.scene
    );

    const material = new StandardMaterial(`powerUpIconMat-${id}`, this.scene);
    const texture = new Texture(getPowerUpIconPath(powerUpType), this.scene);

    material.emissiveColor = effectColor;
    material.diffuseTexture = texture;
    material.opacityTexture = texture;

    material.useAlphaFromDiffuseTexture = true;
    material.disableLighting = true;
    material.backFaceCulling = false;

    icon.material = material;
    icon.position = position.clone();
    icon.scaling = new Vector3(1, 1, 1);

    icon.metadata = {
      disposing: false,
    };

    return icon;
  }

  private createTubeRing(position: Vector3, effectColor: Color3, id: string): Mesh {
    const radius = this.circleSize / 2;
    const path = [];

    for (let i = 0; i <= this.numSegments; i++) {
      const angle = (i / this.numSegments) * Math.PI * 2;
      path.push(
        new Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          defaultGameObjectParams.distanceFromFloor
        )
      );
    }

    const tube = MeshBuilder.CreateTube(
      `powerUpTube-${id}`,
      {
        path: path,
        radius: this.tubeRadius,
        tessellation: 4,
        cap: Mesh.CAP_ALL,
        updatable: true,
      },
      this.scene
    );

    const pbr = new PBRMaterial(`tubeRingMat-${id}`, this.scene);
    const emissiveMultipler = 1.5;

    pbr.albedoColor = effectColor;
    pbr.emissiveColor = new Color3(
      effectColor.r * emissiveMultipler,
      effectColor.g * emissiveMultipler,
      effectColor.b * emissiveMultipler
    );

    pbr.emissiveIntensity = 0.5;
    pbr.environmentIntensity = 1.0;

    pbr.metallic = 0.0;
    pbr.roughness = 0.1;
    pbr.alpha = 0.8;

    pbr.subSurface.isRefractionEnabled = true;
    pbr.subSurface.refractionIntensity = 0.8;
    pbr.subSurface.indexOfRefraction = 1.5;
    pbr.subSurface.isTranslucencyEnabled = true;
    pbr.subSurface.translucencyIntensity = 1.0;
    pbr.disableLighting = false;

    tube.position = position.clone();
    tube.material = pbr;

    const progressGlowLayer = new GlowLayer(`progress-glow-${id}`, this.scene);
    progressGlowLayer.intensity = 1.0;
    progressGlowLayer.blurKernelSize = 32;
    progressGlowLayer.addIncludedOnlyMesh(tube);

    tube.metadata = {
      fullPath: path,
      effectColor: effectColor,
      progressGlowLayer: progressGlowLayer,
      disposing: false,
    };

    return tube;
  }

  private createTorusRing(position: Vector3, effectColor: Color3, id: string): Mesh {
    const radius = this.circleSize / 2;

    const glowTorus = MeshBuilder.CreateTorus(
      `glowTorus-${id}`,
      {
        diameter: radius * 2,
        thickness: this.tubeRadius * 2,
        tessellation: 32,
      },
      this.scene
    );

    const glowMaterial = new StandardMaterial(`glowTorusMat-${id}`, this.scene);

    glowMaterial.emissiveColor = effectColor.clone();
    glowMaterial.disableLighting = true;
    glowMaterial.alpha = 0.1;

    glowTorus.material = glowMaterial;
    glowTorus.position = position.clone();
    glowTorus.rotation.x = Math.PI / 2;

    const constantGlowLayer = new GlowLayer(`constant-glow-${id}`, this.scene);
    constantGlowLayer.intensity = 1.2;
    constantGlowLayer.blurKernelSize = 64;
    constantGlowLayer.addIncludedOnlyMesh(glowTorus);

    glowTorus.metadata = {
      glowLayer: constantGlowLayer,
      disposing: false,
    };

    return glowTorus;
  }

  private createRingParticles(tubeMesh: Mesh, effectColor: Color3, id: string): ParticleSystem {
    const particleSystem = new ParticleSystem(`ringParticles-${id}`, 300, this.scene);

    particleSystem.particleTexture = createParticleTexture(this.scene, effectColor);

    const emitterPosition = tubeMesh.position.clone();
    const radius = this.circleSize / 2;

    particleSystem.createSphereEmitter(radius, 0.1);

    particleSystem.emitter = emitterPosition;

    particleSystem.color1 = new Color4(effectColor.r, effectColor.g, effectColor.b, 1.0);
    particleSystem.color2 = new Color4(
      Math.min(effectColor.r * 2.0, 1.0),
      Math.min(effectColor.g * 2.0, 1.0),
      Math.min(effectColor.b * 2.0, 1.0),
      1.0
    );

    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.2;
    particleSystem.emitRate = 150;
    particleSystem.minLifeTime = 0.5;
    particleSystem.maxLifeTime = 1.0;

    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    tubeMesh.onAfterWorldMatrixUpdateObservable.add(() => {
      particleSystem.emitter = tubeMesh.position.clone();
    });

    particleSystem.start();

    return particleSystem;
  }

  private createSpawnAnimations(mesh: Mesh, effectColor: Color3, id: string): Animation[] {
    const frameRate = 30;

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const spawnScaleAnim = new Animation(
      `powerUpSpawnScaleAnim-${id}`,
      'scaling',
      frameRate,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const spawnScaleKeys = [
      { frame: 0, value: new Vector3(0, 0, 0) },
      { frame: 15, value: new Vector3(0.9, 0.9, 0.9) },
      { frame: 25, value: new Vector3(1.1, 1.1, 1.1) },
      { frame: 30, value: new Vector3(1, 1, 1) },
    ];

    spawnScaleAnim.setKeys(spawnScaleKeys);
    spawnScaleAnim.setEasingFunction(easingFunction);

    if (mesh.material && mesh.material instanceof StandardMaterial) {
      const flashColor = new Color3(2, 1, 1);
      const colorAnim = new Animation(
        `powerUpSpawnColorAnim-${id}`,
        'material.emissiveColor',
        frameRate,
        Animation.ANIMATIONTYPE_COLOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      const colorKeys = [
        { frame: 0, value: effectColor.clone() },
        { frame: 20, value: effectColor.clone() },
        { frame: 25, value: flashColor },
        { frame: 30, value: effectColor.clone() },
      ];

      colorAnim.setKeys(colorKeys);
      colorAnim.setEasingFunction(easingFunction);

      return [spawnScaleAnim, colorAnim];
    }

    return [spawnScaleAnim];
  }

  private updateProgressRing(display: ActivePowerUpDisplay): void {
    if (display.tubeMesh.metadata?.disposing) return;

    const percentRemaining = Math.max(0, display.timeToExpire / display.initialTime);

    if (display.tubeMesh && display.tubeMesh.metadata) {
      const tube = display.tubeMesh;
      const fullPath = tube.metadata.fullPath;

      const segmentsToShow = Math.ceil(percentRemaining * this.numSegments);
      const currentAngle = (segmentsToShow / this.numSegments) * Math.PI * 2;

      tube.metadata.currentAngle = currentAngle;

      if (tube.metadata.currentSegments !== segmentsToShow) {
        tube.metadata.currentSegments = segmentsToShow;

        if (segmentsToShow <= 0) {
          display.particleSystem.emitRate = 0;
          tube.visibility = 0;
        } else {
          let partialPath = [];

          partialPath = fullPath.slice(0, segmentsToShow + 1);

          MeshBuilder.CreateTube(
            tube.name,
            {
              path: partialPath,
              radius: this.tubeRadius,
              tessellation: 8,
              cap: Mesh.CAP_ALL,
              instance: tube,
            },
            this.scene
          );
        }
      }
    }

    if (
      display.timeToExpire <= 50 &&
      !display.tubeMesh.metadata?.expiring &&
      !display.tubeMesh.metadata?.disposing
    ) {
      display.tubeMesh.metadata.expiring = true;
      setTimeout(() => {
        if (this.activeDisplays.has(display.id)) {
          // Give a slight delay before disposing
          this.disposeDisplayWithAnimation(display.id);

          setTimeout(() => {
            // Schedule repositioning after animation
            this.repositionPlayerDisplays(display.player);
          }, 700);
        }
      }, 200);
    }
  }

  private repositionPlayerDisplays(playerType: 'player1' | 'player2'): void {
    const playerDisplays = Array.from(this.activeDisplays.values())
      .filter((d) => d.player === playerType)
      .sort((a, b) => a.index - b.index);

    playerDisplays.forEach((display, index) => {
      display.index = index;

      const xOffset = this.gameWidth + this.iconXOffset;
      const xPosition = playerType === 'player1' ? -xOffset : xOffset;
      const yPosition = this.iconYOffset - index * this.ySpacing;

      const newPosition = new Vector3(
        xPosition,
        yPosition,
        defaultGameObjectParams.distanceFromFloor
      );

      this.animatePositionChange(display, newPosition);
    });
  }

  private animatePositionChange(display: ActivePowerUpDisplay, newPosition: Vector3): void {
    if (display.tubeMesh.metadata?.disposing) return;

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    // Create a base animations
    const basePositionAnim = new Animation(
      `baseRepositionAnim-${display.id}`,
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    basePositionAnim.setEasingFunction(easingFunction);

    const baseScaleAnim = new Animation(
      `baseScaleMaintainAnim-${display.id}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    baseScaleAnim.setKeys([
      { frame: 0, value: new Vector3(1, 1, 1) },
      { frame: 30, value: new Vector3(1, 1, 1) },
    ]);
    baseScaleAnim.setEasingFunction(easingFunction);

    // Clone position animations
    const iconPosAnim = basePositionAnim.clone();
    iconPosAnim.name = `iconRepositionAnim-${display.id}`;
    iconPosAnim.setKeys([
      { frame: 0, value: display.iconMesh.position.clone() },
      { frame: 30, value: newPosition.clone() },
    ]);

    const tubePosAnim = basePositionAnim.clone();
    tubePosAnim.name = `tubeRepositionAnim-${display.id}`;
    tubePosAnim.setKeys([
      { frame: 0, value: display.tubeMesh.position.clone() },
      { frame: 30, value: newPosition.clone() },
    ]);

    const torusPosAnim = basePositionAnim.clone();
    torusPosAnim.name = `torusRepositionAnim-${display.id}`;
    torusPosAnim.setKeys([
      { frame: 0, value: display.torusMesh.position.clone() },
      { frame: 30, value: newPosition.clone() },
    ]);

    // Clone scale animations
    const iconScaleAnim = baseScaleAnim.clone();
    iconScaleAnim.name = `iconScaleMaintainAnim-${display.id}`;
    iconScaleAnim.setKeys([
      { frame: 0, value: display.iconMesh.scaling.clone() },
      { frame: 30, value: new Vector3(1, 1, 1) },
    ]);

    const tubeScaleAnim = baseScaleAnim.clone();
    tubeScaleAnim.name = `tubeScaleMaintainAnim-${display.id}`;
    tubeScaleAnim.setKeys([
      { frame: 0, value: display.tubeMesh.scaling.clone() },
      { frame: 30, value: new Vector3(1, 1, 1) },
    ]);

    const torusScaleAnim = baseScaleAnim.clone();
    torusScaleAnim.name = `torusScaleMaintainAnim-${display.id}`;
    torusScaleAnim.setKeys([
      { frame: 0, value: display.torusMesh.scaling.clone() },
      { frame: 30, value: new Vector3(1, 1, 1) },
    ]);

    // Apply animations
    display.iconMesh.animations = [iconPosAnim, iconScaleAnim];
    display.tubeMesh.animations = [tubePosAnim, tubeScaleAnim];
    display.torusMesh.animations = [torusPosAnim, torusScaleAnim];

    // Start animations
    this.scene.beginAnimation(display.iconMesh, 0, 30, false, 1, () => {
      display.position = newPosition.clone();
    });

    this.scene.beginAnimation(display.tubeMesh, 0, 30, false);
    this.scene.beginAnimation(display.torusMesh, 0, 30, false, 1, () => {
      if (display.particleSystem && display.particleSystem.emitter) {
        display.particleSystem.emitter = display.tubeMesh;
      }
      this.animateActiveDisplay(display);
    });
  }

  private animateActiveDisplay(display: ActivePowerUpDisplay): void {
    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    // Power-up icon scaling animations
    const scaleXAnim = new Animation(
      `powerUpScaleXAnim-${display.id}`,
      'scaling.x',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const scaleXKeys = [
      { frame: 0, value: 1.0 },
      { frame: 15, value: 1.1 },
      { frame: 45, value: 1.05 },
      { frame: 60, value: 1.0 },
    ];
    scaleXAnim.setKeys(scaleXKeys);
    scaleXAnim.setEasingFunction(easingFunction);

    const scaleYAnim = new Animation(
      `powerUpScaleYAnim-${display.id}`,
      'scaling.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const scaleYKeys = [
      { frame: 0, value: 1.0 },
      { frame: 15, value: 1.05 },
      { frame: 45, value: 1.1 },
      { frame: 60, value: 1.0 },
    ];
    scaleYAnim.setKeys(scaleYKeys);
    scaleYAnim.setEasingFunction(easingFunction);

    // Keep Z scale consistent
    const scaleZAnim = new Animation(
      `powerUpScaleZAnim-${display.id}`,
      'scaling.z',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const scaleZKeys = [
      { frame: 0, value: 1.0 },
      { frame: 60, value: 1.0 },
    ];
    scaleZAnim.setKeys(scaleZKeys);

    const originalY = display.iconMesh.position.y;

    // Create hover animation for the icon
    const iconPosAnim = new Animation(
      `powerUpHoverAnim-${display.id}-icon`,
      'position.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );
    const positionKeys = [
      { frame: 0, value: originalY },
      { frame: 15, value: originalY + 0.08 },
      { frame: 30, value: originalY },
      { frame: 45, value: originalY - 0.08 },
      { frame: 60, value: originalY },
    ];
    iconPosAnim.setKeys(positionKeys);
    iconPosAnim.setEasingFunction(easingFunction);

    const tubePosAnim = iconPosAnim.clone();
    tubePosAnim.name = `powerUpHoverAnim-${display.id}-tube`;

    const torusPosAnim = iconPosAnim.clone();
    torusPosAnim.name = `powerUpHoverAnim-${display.id}-torus`;

    display.iconMesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim, iconPosAnim];
    display.tubeMesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim, iconPosAnim];
    display.torusMesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim, iconPosAnim];

    this.scene.beginAnimation(display.iconMesh, 0, 60, true);
    this.scene.beginAnimation(display.tubeMesh, 0, 60, true);
    this.scene.beginAnimation(display.torusMesh, 0, 60, true);
  }

  private disposeDisplayWithAnimation(id: string): void {
    const display = this.activeDisplays.get(id);
    const scene = this.scene;

    if (!display || display.tubeMesh.metadata?.disposing) return;

    if (display.tubeMesh.metadata) display.tubeMesh.metadata.disposing = true;
    if (display.torusMesh.metadata) display.torusMesh.metadata.disposing = true;
    if (display.iconMesh.metadata) display.iconMesh.metadata.disposing = true;

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    // Setup icon animations
    const iconScaleAnim = new Animation(
      `powerUpRemoveIconAnim-${id}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const iconScaleKeys = [
      { frame: 0, value: display.iconMesh.scaling.clone() },
      { frame: 10, value: display.iconMesh.scaling.scale(1.1) },
      { frame: 20, value: display.iconMesh.scaling.scale(0.3) },
      { frame: 30, value: new Vector3(0, 0, 0) },
    ];
    iconScaleAnim.setKeys(iconScaleKeys);
    iconScaleAnim.setEasingFunction(easingFunction);

    const iconMaterial = display.iconMesh.material as StandardMaterial;
    if (iconMaterial) {
      const originalColor = iconMaterial.emissiveColor.clone();
      const flashColor = new Color3(2, 1, 1);
      const iconColorAnim = new Animation(
        `powerUpRemoveIconColorAnim-${id}`,
        'material.emissiveColor',
        30,
        Animation.ANIMATIONTYPE_COLOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      const iconColorKeys = [
        { frame: 0, value: originalColor },
        { frame: 10, value: flashColor },
        { frame: 15, value: originalColor },
        { frame: 30, value: originalColor },
      ];
      iconColorAnim.setKeys(iconColorKeys);
      iconColorAnim.setEasingFunction(easingFunction);

      display.iconMesh.animations = [iconScaleAnim, iconColorAnim];
    } else {
      display.iconMesh.animations = [iconScaleAnim];
    }

    // Setup torus animations
    const torusScaleAnim = new Animation(
      `powerUpTorusRemoveAnim-${id}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const torusScaleKeys = [
      { frame: 0, value: display.torusMesh.scaling.clone() },
      { frame: 10, value: display.torusMesh.scaling.scale(0.9) },
      { frame: 20, value: display.torusMesh.scaling.scale(0.5) },
      { frame: 30, value: new Vector3(0, 0, 0) },
    ];
    torusScaleAnim.setKeys(torusScaleKeys);
    torusScaleAnim.setEasingFunction(easingFunction);

    // Setup tube animation
    const tubeScaleAnim = new Animation(
      `powerUpTubeRemoveAnim-${id}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const tubeScaleKeys = [
      { frame: 0, value: display.tubeMesh.scaling.clone() },
      { frame: 10, value: new Vector3(0, 0, 0) },
    ];
    tubeScaleAnim.setKeys(tubeScaleKeys);
    tubeScaleAnim.setEasingFunction(easingFunction);

    display.tubeMesh.animations = [tubeScaleAnim];
    display.torusMesh.animations = [torusScaleAnim];

    // Handle particle fadeout
    if (display.particleSystem) {
      const startTime = Date.now();
      const fadeOutDuration = 800;
      const iconCenter = display.iconMesh.position.clone();

      const originalUpdateFn = display.particleSystem.updateFunction;

      display.particleSystem.updateFunction = (particles) => {
        // Call original update function if it exists
        if (originalUpdateFn) originalUpdateFn(particles);

        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / fadeOutDuration, 1);
        const easedProgress = progress * progress * progress;

        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];

          const directionX = iconCenter.x - particle.position.x;
          const directionY = iconCenter.y - particle.position.y;
          const directionZ = iconCenter.z - particle.position.z;

          const distance = Math.sqrt(
            directionX * directionX + directionY * directionY + directionZ * directionZ
          );

          const speedFactor = 0.01 + easedProgress * 0.2 + distance * 0.01;

          particle.position.x += directionX * speedFactor;
          particle.position.y += directionY * speedFactor;
          particle.position.z += directionZ * speedFactor;

          particle.size *= 1 - easedProgress * 0.5;

          if (distance < 0.3) {
            particle.color.a *= 1 - (0.3 - distance) / 0.3;
          } else {
            particle.color.a = Math.max(0.1, 1 - easedProgress * 1.2);
          }
        }
      };

      display.particleSystem.emitRate = 0;
    }

    scene.beginAnimation(display.tubeMesh, 0, 10, false);
    scene.beginAnimation(display.torusMesh, 0, 30, false);
    scene.beginAnimation(display.iconMesh, 0, 30, false, 1, () => {
      this.finalizeDisposal(id);
    });
  }

  private finalizeDisposal(id: string): void {
    const display = this.activeDisplays.get(id);

    if (!display) return;

    if (display.particleSystem) display.particleSystem.dispose();

    if (display.tubeMesh.material) display.tubeMesh.material.dispose();
    if (display.iconMesh.material) display.iconMesh.material.dispose();
    if (display.torusMesh.material) display.torusMesh.material.dispose();

    if (display.tubeMesh.metadata?.progressGlowLayer) {
      display.tubeMesh.metadata.progressGlowLayer.dispose();
    }
    if (display.torusMesh.metadata?.glowLayer) {
      display.torusMesh.metadata.glowLayer.dispose();
    }

    display.iconMesh.dispose();
    display.tubeMesh.dispose();
    display.torusMesh.dispose();

    this.activeDisplays.delete(id);
  }

  public disposeAll(): void {
    const displayIds = Array.from(this.activeDisplays.keys());

    displayIds.forEach((id, index) => {
      setTimeout(() => {
        if (this.activeDisplays.has(id)) {
          this.disposeDisplayWithAnimation(id);
        }
      }, index * 200);
    });
  }
}
