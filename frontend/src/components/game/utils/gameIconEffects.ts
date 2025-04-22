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
  tubeMesh: Mesh; // Tube ring mesh
  particleSystem: ParticleSystem; // Single particle system for the ring
  glowLayer: GlowLayer;
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
  private circleSize: number; // Size of the circle
  private tubeRadius: number; // Radius of the tube itself
  private numSegments: number = 64; // Higher segment count for smoother circle
  private showTubeRing: boolean = true; // Flag to control tube visibility

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

    const glowLayer = new GlowLayer(`powerUp-glow-${id}`, this.scene);

    glowLayer.intensity = 0.5;
    glowLayer.blurKernelSize = 64;
    glowLayer.addIncludedOnlyMesh(tubeMesh);

    // Store the display
    const display: ActivePowerUpDisplay = {
      id,
      powerUpType: powerUp.type,
      iconMesh: iconMesh,
      tubeMesh: tubeMesh,
      particleSystem: particleSystem,
      glowLayer,
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
    // Create a circular path for the tube
    const path = [];
    const radius = this.circleSize / 2;

    for (let i = 0; i <= this.numSegments; i++) {
      const angle = (i / this.numSegments) * Math.PI * 2;
      // Create circle in XY plane with constant Z
      path.push(
        new Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0 // Constant Z
        )
      );
    }

    // Create a tube along this path
    const tube = MeshBuilder.CreateTube(
      `powerUpTube-${id}`,
      {
        path: path,
        radius: this.tubeRadius,
        tessellation: 16, // Match edge tessellation value
        cap: Mesh.CAP_ALL,
        updatable: true,
        sideOrientation: Mesh.DOUBLESIDE,
      },
      this.scene
    );

    // Create PBR material like the edge material
    const pbr = new PBRMaterial(`tubeRingMat-${id}`, this.scene);

    // Use the exact edge material settings from defaultGameObjectParams
    pbr.albedoColor = effectColor;
    pbr.emissiveColor = new Color3(
      effectColor.r * 1.8, // emissiveColorMultiplier from edge
      effectColor.g * 1.8,
      effectColor.b * 1.8
    );
    pbr.emissiveIntensity = 0.5; // from edge params
    pbr.environmentIntensity = 1.0; // from edge params

    pbr.metallic = 0.0; // materialMetallic from edge
    pbr.roughness = 0.1; // materialRoughness from edge

    // Set up subsurface properties like the edge
    pbr.subSurface.isRefractionEnabled = true;
    pbr.subSurface.refractionIntensity = 0.8; // from edge params
    pbr.subSurface.indexOfRefraction = 1.5; // from edge params
    pbr.subSurface.isTranslucencyEnabled = true;
    pbr.subSurface.translucencyIntensity = 1.0; // from edge params

    // Enable alpha blending for the glow effect
    pbr.alpha = this.showTubeRing ? 0.8 : 0; // Slightly more opaque than before
    pbr.disableLighting = false; // Allow lighting for PBR

    // Add environment reflection if available
    if (this.scene.environmentTexture) {
      pbr.reflectionTexture = this.scene.environmentTexture;
    }

    tube.material = pbr;

    // Position the tube at the icon's position
    tube.position = position.clone();

    // Store the full path for later updates
    tube.metadata = {
      fullPath: path,
      effectColor: effectColor,
    };

    return tube;
  }

  private createRingParticles(tubeMesh: Mesh, effectColor: Color3, id: string): ParticleSystem {
    const particleSystem = new ParticleSystem(`ringParticles-${id}`, 2000, this.scene);

    // Use tube mesh as emitter
    particleSystem.emitter = tubeMesh;
    particleSystem.particleTexture = createParticleTexture(this.scene, effectColor);

    // Configure to emit from vertices
    particleSystem.createPointEmitter(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
    particleSystem.emitFromSpawnPointOnly = false;

    // Use tube vertices as emission points
    particleSystem.createCylinderEmitter(0.1, 0, 0.1, 0);

    // Store angle information in metadata for progress tracking
    tubeMesh.metadata = {
      ...tubeMesh.metadata,
      maxAngle: Math.PI * 2,
      currentAngle: Math.PI * 2,
    };

    particleSystem.startPositionFunction = (worldMatrix, positionToUpdate) => {
      // This will be called for each particle
      if (tubeMesh.getVerticesData) {
        const positions = tubeMesh.getVerticesData('position');
        if (positions && positions.length > 0) {
          const vertexCount = positions.length / 3;

          // Try multiple times to find a valid vertex (within the visible arc)
          for (let attempt = 0; attempt < 10; attempt++) {
            const randomIndex = Math.floor(Math.random() * vertexCount) * 3;

            // Get position from vertex
            const localPos = new Vector3(
              positions[randomIndex],
              positions[randomIndex + 1],
              positions[randomIndex + 2]
            );

            // Calculate angle of this vertex on the ring
            const vertexAngle = Math.atan2(localPos.y, localPos.x);
            const normalizedAngle = vertexAngle < 0 ? vertexAngle + Math.PI * 2 : vertexAngle;

            // Only emit from vertices within the current progress angle
            // The startAngle is always 0, so we check if the vertex angle is less than current angle
            const maxAngle = tubeMesh.metadata.currentAngle || Math.PI * 2;

            if (normalizedAngle <= maxAngle) {
              // Add some small randomness
              localPos.x += (Math.random() - 0.5) * 0.08;
              localPos.y += (Math.random() - 0.5) * 0.08;
              localPos.z += (Math.random() - 0.5) * 0.08;

              // Transform to world space
              Vector3.TransformCoordinatesToRef(localPos, worldMatrix, positionToUpdate);
              return;
            }
          }

          // If we couldn't find a valid vertex after several attempts, use a fallback
          const validIndex = Math.floor(Math.random() * (vertexCount / 2)) * 3;
          const fallbackPos = new Vector3(
            positions[validIndex],
            positions[validIndex + 1],
            positions[validIndex + 2]
          );
          Vector3.TransformCoordinatesToRef(fallbackPos, worldMatrix, positionToUpdate);
        }
      }
    };

    // Enhanced particle appearance
    particleSystem.color1 = new Color4(effectColor.r, effectColor.g, effectColor.b, 0.9);
    particleSystem.color2 = new Color4(
      effectColor.r * 1.8,
      effectColor.g * 1.8,
      effectColor.b * 1.8,
      0.9
    );
    particleSystem.colorDead = new Color4(
      effectColor.r * 0.7,
      effectColor.g * 0.7,
      effectColor.b * 0.7,
      0
    );

    // Increase particle size range
    particleSystem.minSize = 0.04;
    particleSystem.maxSize = 0.12;

    // Slightly increase particle lifetime
    particleSystem.minLifeTime = 0.7;
    particleSystem.maxLifeTime = 1.8;

    // Higher emission rate for denser effect
    particleSystem.emitRate = 500;

    // Enhance movement for more dynamic effect
    particleSystem.direction1 = new Vector3(-0.15, -0.15, -0.15);
    particleSystem.direction2 = new Vector3(0.15, 0.15, 0.15);
    particleSystem.minEmitPower = 0.15;
    particleSystem.maxEmitPower = 0.4;

    // Add gravity to create a slight "falling off" effect
    particleSystem.gravity = new Vector3(0, -0.03, 0);

    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    particleSystem.start();

    return particleSystem;
  }

  private updateProgressRing(display: ActivePowerUpDisplay): void {
    const percentRemaining = Math.max(0, display.timeToExpire / display.initialTime);

    // Only update the tube if necessary
    if (display.tubeMesh && display.tubeMesh.metadata) {
      const tube = display.tubeMesh;
      const fullPath = tube.metadata.fullPath;

      // Calculate how much of the path should be visible
      const segmentsToShow = Math.ceil(percentRemaining * this.numSegments);

      // Calculate the current progress angle (for particles)
      const currentAngle = (segmentsToShow / this.numSegments) * Math.PI * 2;

      // Update the metadata with current angle for particle emission
      tube.metadata.currentAngle = currentAngle;

      // If we need to update the tube
      if (tube.metadata.currentSegments !== segmentsToShow) {
        tube.metadata.currentSegments = segmentsToShow;

        if (segmentsToShow <= 0) {
          // Hide tube completely
          tube.visibility = 0;
          display.particleSystem.emitRate = 0;
        } else {
          // Create the path for the visible portion of the ring
          let partialPath = [];

          if (segmentsToShow >= this.numSegments) {
            // Full circle - use all points
            partialPath = fullPath.slice();
          } else {
            // Partial circle - create a clean arc
            partialPath = fullPath.slice(0, segmentsToShow + 1);
          }

          // Update the tube mesh
          MeshBuilder.CreateTube(
            tube.name,
            {
              path: partialPath,
              radius: this.tubeRadius,
              tessellation: 8,
              cap: Mesh.CAP_ALL,
              instance: tube,
              sideOrientation: Mesh.DOUBLESIDE,
            },
            this.scene
          );

          // Dynamically adjust particle parameters based on progress

          // Adjust emission rate based on progress
          const baseEmitRate = 500;
          display.particleSystem.emitRate = baseEmitRate * percentRemaining;

          // Increase particle energy as progress decreases to create urgency
          if (percentRemaining < 0.5) {
            const intensityFactor = 1 + (0.5 - percentRemaining) * 0.8;
            display.particleSystem.minEmitPower = 0.15 * intensityFactor;
            display.particleSystem.maxEmitPower = 0.4 * intensityFactor;

            // Optional: change color as time runs out
            if (percentRemaining < 0.25) {
              const material = tube.material as StandardMaterial;
              if (material) {
                const urgencyColor = display.tubeMesh.metadata.effectColor.clone();
                // Make it more intense (whiter/brighter)
                const intensity = 1 + (0.25 - percentRemaining) * 2;
                urgencyColor.scaleToRef(intensity, urgencyColor);
                material.emissiveColor = urgencyColor;
              }
            }
          }
        }
      }
    }

    // Check if time has expired
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

    this.scene.stopAnimation(display.iconMesh);
    this.scene.stopAnimation(display.tubeMesh);

    if (display.tubeMesh.material) {
      this.scene.stopAnimation(display.tubeMesh.material);
    }

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

    // Turn off particles
    display.particleSystem.emitRate = 0;

    this.scene.beginAnimation(display.iconMesh, 0, 30, false, 1, () => {
      this.disposeDisplay(id);
    });

    this.scene.beginAnimation(display.tubeMesh, 0, 30, false);
  }

  private repositionPlayerDisplays(playerType: 'player1' | 'player2'): void {
    // Get all displays for this player
    const playerDisplays = Array.from(this.activeDisplays.values())
      .filter((d) => d.player === playerType)
      .sort((a, b) => a.index - b.index);

    playerDisplays.forEach((display, index) => {
      display.index = index;

      const isPlayer1 = playerType === 'player1';

      // Use absolute positioning in scene units
      // Calculate base X position - positioned at sides of screen
      const xOffset = this.gameWidth + this.iconXOffset;
      const xPos = isPlayer1 ? -xOffset : xOffset;

      // Calculate Y position - negative values are toward the top of screen
      // Add spacing for multiple icons
      const yPos = this.iconYOffset + index * this.ySpacing;

      const newPosition = new Vector3(xPos, yPos, defaultGameObjectParams.distanceFromFloor);

      this.animatePositionChange(display, newPosition);
    });
  }

  private animatePositionChange(display: ActivePowerUpDisplay, newPosition: Vector3): void {
    this.scene.stopAnimation(display.iconMesh);
    this.scene.stopAnimation(display.tubeMesh);

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

    const posAnim = new Animation(
      `powerUpRepositionAnim-${display.id}`,
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const keys = [
      { frame: 0, value: display.iconMesh.position.clone() },
      { frame: 30, value: newPosition },
    ];
    posAnim.setKeys(keys);
    posAnim.setEasingFunction(easingFunction);

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
      { frame: 30, value: newPosition.clone() },
    ];
    tubePosAnim.setKeys(tubeKeys);
    tubePosAnim.setEasingFunction(easingFunction);

    display.iconMesh.animations = [posAnim];
    display.tubeMesh.animations = [tubePosAnim];

    this.scene.beginAnimation(display.iconMesh, 0, 30, false, 1, () => {
      display.position = newPosition.clone();
    });

    this.scene.beginAnimation(display.tubeMesh, 0, 30, false, 1, () => {
      // After animation, update particle system emitter
      if (display.particleSystem && display.particleSystem.emitter) {
        display.particleSystem.emitter = display.tubeMesh;
      }
    });
  }

  private animateActiveDisplay(display: ActivePowerUpDisplay): void {
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
      { frame: 15, value: 1.2 },
      { frame: 30, value: 1.0 },
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
      { frame: 15, value: 1.2 },
      { frame: 30, value: 1.0 },
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
      { frame: 30, value: 0.5 },
    ];
    scaleZAnim.setKeys(scaleZKeys);

    // Tube ring subtle rotation animation
    // Since we're now in XY plane, we rotate around Z axis for a spinning effect
    const tubeRotationAnim = new Animation(
      `tubeRotationAnim-${display.id}`,
      'rotation.z',
      240,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const rotationKeys = [
      { frame: 0, value: 0 },
      { frame: 240, value: Math.PI * 2 },
    ];
    tubeRotationAnim.setKeys(rotationKeys);

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    scaleXAnim.setEasingFunction(easingFunction);
    scaleYAnim.setEasingFunction(easingFunction);

    display.iconMesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim];
    display.tubeMesh.animations = [tubeRotationAnim];

    this.scene.beginAnimation(display.iconMesh, 0, 30, true);
    this.scene.beginAnimation(display.tubeMesh, 0, 240, true);
  }

  private disposeDisplay(id: string): void {
    const display = this.activeDisplays.get(id);

    if (!display) return;

    this.scene.stopAnimation(display.iconMesh);
    this.scene.stopAnimation(display.tubeMesh);

    if (display.tubeMesh.material) {
      this.scene.stopAnimation(display.tubeMesh.material);
    }

    if (display.iconMesh.material) display.iconMesh.material.dispose();
    if (display.tubeMesh.material) display.tubeMesh.material.dispose();

    display.iconMesh.dispose();
    display.tubeMesh.dispose();

    // Dispose particle system
    if (display.particleSystem) {
      display.particleSystem.dispose();
    }

    if (display.glowLayer) display.glowLayer.dispose();

    this.activeDisplays.delete(id);
  }

  public disposeAll(): void {
    this.activeDisplays.forEach((_, id) => {
      this.disposeDisplay(id);
    });
    this.activeDisplays.clear();
  }

  // Add method to toggle tube visibility
  public setTubeRingVisibility(visible: boolean): void {
    this.showTubeRing = visible;

    // Update all existing tube materials
    this.activeDisplays.forEach((display) => {
      const material = display.tubeMesh.material as StandardMaterial;
      if (material) {
        if (visible) {
          material.alpha = 0.4;
        } else {
          material.alpha = 0;
        }
      }
    });
  }
}
