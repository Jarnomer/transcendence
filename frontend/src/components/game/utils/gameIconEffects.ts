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
  private iconSize: number;
  private ySpacing: number;
  private circleSize: number;
  private tubeRadius: number;
  private numSegments: number = 64;

  private iconXOffset: number = 3.5;
  private iconYOffset: number = 9.0;
  private iconSizeMultiplier: number = 1.5;

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
    this.iconSize = gameToSceneSize(defaultGameParams.powerUps.size) * this.iconSizeMultiplier;
    this.ySpacing = this.iconSize * 1.5;
    this.circleSize = this.iconSize * 1.25;
    this.tubeRadius = this.iconSize * 0.025;
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

    // Remove expired displays
    const expiredDisplays: string[] = [];
    this.activeDisplays.forEach((display, id) => {
      if (display.player === playerType && !currentPowerUpIds.has(id)) {
        expiredDisplays.push(id);
      }
    });

    expiredDisplays.forEach((id) => {
      this.removePowerUpDisplay(id);
    });

    // Reposition remaining displays
    this.repositionPlayerDisplays(playerType);
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
    const yPosition = this.iconYOffset + index * this.ySpacing;
    const zPosition = defaultGameObjectParams.distanceFromFloor;

    const effectColor = powerUp.isNegative ? this.secondaryColor : this.primaryColor;

    const iconPosition = new Vector3(xPosition, yPosition, zPosition);

    const iconMesh = this.createPowerUpIcon(powerUp.type, iconPosition, effectColor, id);
    const tubeMesh = this.createTubeRing(iconPosition, effectColor, id);
    const particleSystem = this.createRingParticles(tubeMesh, effectColor, id);

    // Store the display
    const display: ActivePowerUpDisplay = {
      id,
      powerUpType: powerUp.type,
      iconMesh: iconMesh,
      tubeMesh: tubeMesh,
      particleSystem: particleSystem,
      timeToExpire: powerUp.timeToExpire,
      initialTime: powerUp.timeToExpire,
      position: iconPosition,
      player: playerType,
      index,
    };

    this.activeDisplays.set(id, display);

    this.animateActiveDisplay(display);
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

    // Create main progress tube
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

    // Create constant glow torus
    const glowTorus = MeshBuilder.CreateTorus(
      `glowTorus-${id}`,
      {
        diameter: radius * 2,
        thickness: this.tubeRadius * 2,
        tessellation: 32,
      },
      this.scene
    );

    // Create material for glow torus
    const glowMaterial = new StandardMaterial(`glowTorusMat-${id}`, this.scene);

    glowMaterial.emissiveColor = effectColor.clone();
    glowMaterial.disableLighting = true;
    glowMaterial.alpha = 0.1;

    glowTorus.material = glowMaterial;
    glowTorus.position = position.clone();
    glowTorus.rotation.x = Math.PI / 2;

    // Create glow layers
    const progressGlowLayer = new GlowLayer(`progress-glow-${id}`, this.scene);
    progressGlowLayer.intensity = 0.8;
    progressGlowLayer.blurKernelSize = 32;
    progressGlowLayer.addIncludedOnlyMesh(tube);

    const constantGlowLayer = new GlowLayer(`constant-glow-${id}`, this.scene);
    constantGlowLayer.intensity = 0.8;
    constantGlowLayer.blurKernelSize = 64;
    constantGlowLayer.addIncludedOnlyMesh(glowTorus);

    // Store everything in metadata
    tube.metadata = {
      fullPath: path,
      effectColor: effectColor,
      glowTorus: glowTorus,
      progressGlowLayer: progressGlowLayer,
      constantGlowLayer: constantGlowLayer,
    };

    return tube;
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

    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.15;
    particleSystem.emitRate = 120;
    particleSystem.minLifeTime = 0.4;
    particleSystem.maxLifeTime = 1.0;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    tubeMesh.onAfterWorldMatrixUpdateObservable.add(() => {
      particleSystem.emitter = tubeMesh.position.clone();
    });

    particleSystem.start();

    return particleSystem;
  }

  private updateProgressRing(display: ActivePowerUpDisplay): void {
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

          const baseEmitRate = 500;

          display.particleSystem.emitRate = baseEmitRate * percentRemaining;

          if (percentRemaining < 0.3) {
            const intensityFactor = 1 + (0.5 - percentRemaining) * 0.8;
            display.particleSystem.minEmitPower = 0.15 * intensityFactor;
            display.particleSystem.maxEmitPower = 0.4 * intensityFactor;
          }
        }
      }
    }

    if (display.timeToExpire <= 50 && !display.tubeMesh.metadata?.expiring) {
      display.tubeMesh.metadata.expiring = true;
      setTimeout(() => {
        // Give a slight delay before disposing
        if (this.activeDisplays.has(display.id)) {
          this.removePowerUpDisplay(display.id);
        }
      }, 200);
    }
  }

  private removePowerUpDisplay(id: string): void {
    const display = this.activeDisplays.get(id);

    if (!display) return;

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    // Animate disappearance
    const scaleAnim = new Animation(
      `powerUpRemoveAnim-${id}`,
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const keys = [
      { frame: 0, value: display.iconMesh.scaling.clone() },
      { frame: 30, value: new Vector3(0, 0, 0) },
    ];
    scaleAnim.setKeys(keys);
    scaleAnim.setEasingFunction(easingFunction);

    display.iconMesh.animations = [scaleAnim];
    display.tubeMesh.animations = [scaleAnim.clone()];

    display.particleSystem.emitRate = 0;

    this.scene.beginAnimation(display.iconMesh, 0, 30, false, 1, () => {
      this.disposeDisplay(id);
    });

    this.scene.beginAnimation(display.tubeMesh, 0, 30, false);
  }

  private repositionPlayerDisplays(playerType: 'player1' | 'player2'): void {
    const playerDisplays = Array.from(this.activeDisplays.values())
      .filter((d) => d.player === playerType)
      .sort((a, b) => a.index - b.index);

    playerDisplays.forEach((display, index) => {
      display.index = index;

      const xOffset = this.gameWidth + this.iconXOffset;
      const xPosition = playerType === 'player1' ? -xOffset : xOffset;
      const yPosition = this.iconYOffset + index * this.ySpacing;

      const newPosition = new Vector3(
        xPosition,
        yPosition,
        defaultGameObjectParams.distanceFromFloor
      );

      this.animatePositionChange(display, newPosition);
    });
  }

  private animatePositionChange(display: ActivePowerUpDisplay, newPosition: Vector3): void {
    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const glowTorus = display.tubeMesh.metadata?.glowTorus;

    // Icon position animation
    const iconPosAnim = new Animation(
      `powerUpRepositionAnim-${display.id}`,
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const iconKeys = [
      { frame: 0, value: display.iconMesh.position.clone() },
      { frame: 60, value: newPosition },
    ];
    iconPosAnim.setKeys(iconKeys);
    iconPosAnim.setEasingFunction(easingFunction);

    // Tube position animation
    const tubePosAnim = new Animation(
      `tubeRepositionAnim-${display.id}`,
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const tubeKeys = [
      { frame: 0, value: display.tubeMesh.position.clone() },
      { frame: 60, value: newPosition.clone() },
    ];
    tubePosAnim.setKeys(tubeKeys);
    tubePosAnim.setEasingFunction(easingFunction);

    display.iconMesh.animations = [iconPosAnim];
    display.tubeMesh.animations = [tubePosAnim];

    if (glowTorus) {
      // If we have a glow torus, animate it too
      glowTorus.animations = [tubePosAnim.clone()];
      this.scene.beginAnimation(glowTorus, 0, 60, false);
    }

    this.scene.beginAnimation(display.iconMesh, 0, 60, false, 1, () => {
      display.position = newPosition.clone();
    });

    this.scene.beginAnimation(display.tubeMesh, 0, 60, false, 1, () => {
      if (display.particleSystem && display.particleSystem.emitter) {
        display.particleSystem.emitter = display.tubeMesh;
      }
    });
  }

  private animateActiveDisplay(display: ActivePowerUpDisplay): void {
    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    // Power-up icon animations
    const scaleXAnim = new Animation(
      `powerUpScaleXAnim-${display.id}`,
      'scaling.x',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const scaleXKeys = [
      { frame: 0, value: 0.8 },
      { frame: 30, value: 1.2 },
      { frame: 60, value: 1.0 },
    ];
    scaleXAnim.setKeys(scaleXKeys);

    const scaleYAnim = new Animation(
      `powerUpScaleYAnim-${display.id}`,
      'scaling.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const scaleYKeys = [
      { frame: 0, value: 0.8 },
      { frame: 30, value: 1.2 },
      { frame: 60, value: 1.0 },
    ];
    scaleYAnim.setKeys(scaleYKeys);

    const scaleZAnim = new Animation(
      `powerUpScaleZAnim-${display.id}`,
      'scaling.z',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const scaleZKeys = [
      { frame: 0, value: 0.5 },
      { frame: 60, value: 0.5 },
    ];
    scaleZAnim.setKeys(scaleZKeys);

    scaleXAnim.setEasingFunction(easingFunction);
    scaleYAnim.setEasingFunction(easingFunction);

    // TODO Tube ring animations

    display.iconMesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim];

    this.scene.beginAnimation(display.iconMesh, 0, 60, true);
  }

  private disposeDisplay(id: string): void {
    const display = this.activeDisplays.get(id);

    if (!display) return;

    if (display.particleSystem) display.particleSystem.dispose();

    if (display.tubeMesh.material) display.tubeMesh.material.dispose();
    if (display.iconMesh.material) display.iconMesh.material.dispose();

    // Dispose glow torus if it exists
    if (display.tubeMesh.metadata?.glowTorus) {
      if (display.tubeMesh.metadata.glowTorus.material) {
        display.tubeMesh.metadata.glowTorus.material.dispose();
      }
      display.tubeMesh.metadata.glowTorus.dispose();
    }

    // Dispose glow layers if they exist
    if (display.tubeMesh.metadata?.progressGlowLayer) {
      display.tubeMesh.metadata.progressGlowLayer.dispose();
    }

    if (display.tubeMesh.metadata?.constantGlowLayer) {
      display.tubeMesh.metadata.constantGlowLayer.dispose();
    }

    // Dispose main meshes
    display.iconMesh.dispose();
    display.tubeMesh.dispose();

    this.activeDisplays.delete(id);
  }

  public disposeAll(): void {
    this.activeDisplays.forEach((_, id) => {
      this.disposeDisplay(id);
    });

    this.activeDisplays.clear();
  }
}
