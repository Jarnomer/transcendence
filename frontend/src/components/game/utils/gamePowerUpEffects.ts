import {
  Animation,
  Color3,
  Color4,
  EasingFunction,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
  CubicEase,
} from 'babylonjs';

import { PowerUp } from '@shared/types';

import { createParticleTexture } from './gamePostProcess';

// Interface to track power-up visual effects
interface PowerUpEffect {
  id: number;
  particleSystem: ParticleSystem;
  centerMesh: Mesh;
  cubes: Mesh[]; // Added cubes array to store the rotating cubes
  type: string;
  collected: boolean;
}

export class PowerUpEffectsManager {
  private scene: Scene;
  private effects: Map<number, PowerUpEffect> = new Map();
  private primaryColor: Color3;
  private scaleFactor: number;
  private width: number;
  private height: number;
  private powerUpSize: number;

  constructor(
    scene: Scene,
    primaryColor: Color3,
    width: number,
    height: number,
    scaleFactor: number,
    powerUpSize: number = 20 // Default to match defaultGameParams
  ) {
    this.scene = scene;
    this.primaryColor = primaryColor;
    this.width = width;
    this.height = height;
    this.scaleFactor = scaleFactor;
    this.powerUpSize = powerUpSize;
  }

  // Check for changes in power-ups and update effects accordingly
  updatePowerUpEffects(powerUps: PowerUp[]): void {
    // Check for new power-ups to create effects for
    for (const powerUp of powerUps) {
      if (!this.effects.has(powerUp.id) && !powerUp.collected) {
        this.createPowerUpEffect(powerUp);
      } else if (
        this.effects.has(powerUp.id) &&
        powerUp.collected &&
        !this.effects.get(powerUp.id)!.collected
      ) {
        // Power-up was just collected, trigger collection animation
        this.collectPowerUpEffect(powerUp.id);
      }
    }

    // Check for power-ups that were removed from the game state
    const currentIds = new Set(powerUps.map((p) => p.id));
    for (const [id, effect] of this.effects.entries()) {
      if (!currentIds.has(id) && !effect.collected) {
        // Power-up was removed without being collected
        this.disposeEffect(id);
      }
    }
  }

  // Create particle spiral effect for a power-up
  private createPowerUpEffect(powerUp: PowerUp): void {
    // Convert to Babylon coordinate system
    const x = (powerUp.x - this.width / 2) / this.scaleFactor;
    const y = -((powerUp.y - this.height / 2) / this.scaleFactor);
    const basePosition = new Vector3(x, y, 0);

    // Create center mesh with power-up icon
    const centerMesh = this.createPowerUpMesh(powerUp.type, x, y);

    // Create two cubes that rotate around the power-up
    // Calculate sizes based on powerUpSize (normalized to 1 at default size of 20)
    const baseSize = this.powerUpSize / 20;
    const smallCubeSize = baseSize * 1.2;
    const largeCubeSize = baseSize * 1.5;

    // Create the cubes with appropriate transparency (smaller one more transparent)
    const smallCube = this.createCubeForPowerUp(
      powerUp.id,
      basePosition,
      smallCubeSize,
      0.4,
      this.primaryColor
    );
    const largeCube = this.createCubeForPowerUp(
      powerUp.id,
      basePosition,
      largeCubeSize,
      0.6,
      this.primaryColor
    );

    // Create particle system for spiral effect
    const particleSystem = this.createSpiralParticleSystem(powerUp.id, x, y, this.primaryColor);

    // Store the effect with the cubes
    this.effects.set(powerUp.id, {
      id: powerUp.id,
      particleSystem,
      centerMesh,
      cubes: [smallCube, largeCube], // Store both cubes
      type: powerUp.type,
      collected: false,
    });

    // Start animations
    this.animatePowerUpMesh(centerMesh);
  }

  // Create wireframe cube that rotates around the power-up
  private createCubeForPowerUp(
    powerUpId: number,
    basePosition: Vector3,
    size: number,
    transparency: number,
    color: Color3
  ): Mesh {
    // Create a cube mesh
    const cube = MeshBuilder.CreateBox(
      `powerUpCube-${powerUpId}-${size}`,
      { size: size },
      this.scene
    );

    // Position it initially at the power-up position (exactly where icon spawns)
    cube.position = basePosition.clone();

    // Create material for the cube as wireframe
    const material = new StandardMaterial(`powerUpCubeMaterial-${powerUpId}-${size}`, this.scene);
    material.emissiveColor = color;
    material.alpha = transparency; // Set transparency
    material.disableLighting = true;

    // Make it wireframe
    material.wireframe = true;
    material.useAlphaFromDiffuseTexture = true;

    // Enhance the wireframe edges
    material.backFaceCulling = false; // Show all faces

    cube.material = material;

    // Create random rotation animation
    this.animateCubeRotation(cube, basePosition);

    return cube;
  }

  // Animate cube to rotate in place at the icon location
  private animateCubeRotation(cube: Mesh, centerPosition: Vector3): void {
    // Rotation speeds - different for each cube
    const rotationSpeedX = 0.01 + Math.random() * 0.02;
    const rotationSpeedY = 0.01 + Math.random() * 0.02;
    const rotationSpeedZ = 0.01 + Math.random() * 0.02;

    // Small random initial rotation to make cubes look different
    cube.rotation.x = Math.random() * Math.PI * 2;
    cube.rotation.y = Math.random() * Math.PI * 2;
    cube.rotation.z = Math.random() * Math.PI * 2;

    // For time tracking
    let elapsedTime = 0;

    // Apply animation using scene's onBeforeRenderObservable
    const observer = this.scene.onBeforeRenderObservable.add(() => {
      // Use delta time for frame-independent animation
      const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
      elapsedTime += deltaTime;

      // Keep the cube at the exact icon position
      cube.position.x = centerPosition.x;
      cube.position.y = centerPosition.y;
      cube.position.z = centerPosition.z + 0.1; // Slightly in front

      // Rotate the cube in place
      cube.rotation.x += rotationSpeedX;
      cube.rotation.y += rotationSpeedY;
      cube.rotation.z += rotationSpeedZ;
    });

    // Store the observer and elapsed time for later use
    cube.metadata = { observer, elapsedTime };
  }

  // Create mesh with power-up icon
  private createPowerUpMesh(type: string, x: number, y: number): Mesh {
    // Create a plane mesh for the power-up icon
    const mesh = MeshBuilder.CreatePlane(
      `powerUpIcon-${type}`,
      { width: 2, height: 2 },
      this.scene
    );
    mesh.position = new Vector3(x, y, 0.1);

    // Create material with icon texture based on power-up type
    const material = new StandardMaterial(`powerUpMaterial-${type}`, this.scene);
    material.emissiveColor = this.primaryColor;
    material.disableLighting = true;

    // Load the appropriate PNG file based on power-up type
    const iconPath = this.getPowerUpIconPath(type);
    const texture = new Texture(iconPath, this.scene);

    material.diffuseTexture = texture;
    material.opacityTexture = texture; // Use the same texture for opacity
    material.useAlphaFromDiffuseTexture = true;

    mesh.material = material;
    mesh.scaling = new Vector3(0.5, 0.5, 0.5); // Start small for animation

    return mesh;
  }

  // Get the path to the power-up icon based on type
  private getPowerUpIconPath(type: string): string {
    switch (type) {
      case 'bigger_paddle':
        return '/power-up/paddle_bigger.png';
      case 'smaller_paddle':
        return '/power-up/paddle_smalller.png';
      default:
        // Fallback to bigger paddle if type is not recognized
        return '/power-up/paddle_bigger.png';
    }
  }

  // Animate power-up mesh (pulsing and scaling in x/y axis, hover effect)
  private animatePowerUpMesh(mesh: Mesh): void {
    // Create scaling animation for X axis
    const scaleXAnim = new Animation(
      'powerUpScaleXAnimation',
      'scaling.x',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Define scaling keyframes for X
    const scaleXKeys = [
      { frame: 0, value: 0.5 },
      { frame: 30, value: 0.7 },
      { frame: 60, value: 0.5 },
    ];
    scaleXAnim.setKeys(scaleXKeys);

    // Create scaling animation for Y axis with slightly different timing
    const scaleYAnim = new Animation(
      'powerUpScaleYAnimation',
      'scaling.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Define scaling keyframes for Y
    const scaleYKeys = [
      { frame: 0, value: 0.5 },
      { frame: 15, value: 0.6 }, // Different timing than X for interesting effect
      { frame: 45, value: 0.7 },
      { frame: 60, value: 0.5 },
    ];
    scaleYAnim.setKeys(scaleYKeys);

    // Keep Z scale consistent
    const scaleZAnim = new Animation(
      'powerUpScaleZAnimation',
      'scaling.z',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const scaleZKeys = [
      { frame: 0, value: 0.5 },
      { frame: 60, value: 0.5 },
    ];
    scaleZAnim.setKeys(scaleZKeys);

    // Add hover animation (up and down movement)
    const positionAnim = new Animation(
      'powerUpHoverAnimation',
      'position.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Store original y position
    const originalY = mesh.position.y;

    // Define position keyframes for hover effect
    const positionKeys = [
      { frame: 0, value: originalY },
      { frame: 45, value: originalY + 0.2 },
      { frame: 90, value: originalY },
    ];
    positionAnim.setKeys(positionKeys);

    // Create emissive color pulsing animation for glow effect
    const emissiveAnim = new Animation(
      'powerUpEmissiveAnimation',
      'material.emissiveColor',
      30,
      Animation.ANIMATIONTYPE_COLOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Base color
    const baseColor = this.primaryColor.clone();
    // Brighter version for pulsing
    const brightColor = new Color3(
      Math.min(baseColor.r * 1.5, 1.0),
      Math.min(baseColor.g * 1.5, 1.0),
      Math.min(baseColor.b * 1.5, 1.0)
    );

    // Define emissive color keyframes
    const emissiveKeys = [
      { frame: 0, value: baseColor },
      { frame: 30, value: brightColor },
      { frame: 60, value: baseColor },
    ];
    emissiveAnim.setKeys(emissiveKeys);

    // Apply easing functions for smoother animations
    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    scaleXAnim.setEasingFunction(easingFunction);
    scaleYAnim.setEasingFunction(easingFunction);
    positionAnim.setEasingFunction(easingFunction);

    // Start animations - replacing rotation with x/y scaling
    mesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim, positionAnim, emissiveAnim];
    this.scene.beginAnimation(mesh, 0, 60, true);
  }

  // Create spiral particle system
  private createSpiralParticleSystem(
    id: number,
    x: number,
    y: number,
    color: Color3
  ): ParticleSystem {
    // Create particle system
    const particleSystem = new ParticleSystem(`powerUpParticles-${id}`, 150, this.scene);

    // Particle texture
    particleSystem.particleTexture = createParticleTexture(this.scene, color);

    // Particle emission point
    particleSystem.emitter = new Vector3(x, y, 0);
    particleSystem.minEmitBox = new Vector3(-0.1, -0.1, 0);
    particleSystem.maxEmitBox = new Vector3(0.1, 0.1, 0);

    // Particle colors - add some variation with brighter highlights
    const baseColor = new Color4(color.r, color.g, color.b, 0.8);
    const brightColor = new Color4(
      Math.min(color.r * 1.5, 1.0),
      Math.min(color.g * 1.5, 1.0),
      Math.min(color.b * 1.5, 1.0),
      0.9
    );
    particleSystem.color1 = baseColor;
    particleSystem.color2 = brightColor;
    particleSystem.colorDead = new Color4(color.r, color.g, color.b, 0);

    // Particle behavior
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.15;
    particleSystem.minLifeTime = 1.5;
    particleSystem.maxLifeTime = 3;
    particleSystem.emitRate = 30;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;
    particleSystem.direction1 = new Vector3(-0.5, -0.5, 0);
    particleSystem.direction2 = new Vector3(0.5, 0.5, 0);
    particleSystem.minAngularSpeed = 0.8;
    particleSystem.maxAngularSpeed = 2.0;

    // Spiral motion using onUpdateParticle callback
    particleSystem.updateFunction = (particles) => {
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const age = particle.age / particle.lifeTime;

        // Calculate a unique spiral pattern for this particle
        // Use the particle's index to create variation
        const particleOffset = (i % 10) * 0.1;

        // Spiral parameters
        const baseRadius = 1.8;
        const radius = baseRadius * (age + particleOffset);
        // Create a tighter spiral with more rotations
        const angle = age * Math.PI * 12 + particleOffset * Math.PI * 2;

        // Add a small oscillation to the spiral
        const oscillation = Math.sin(age * Math.PI * 4) * 0.2;

        // Calculate spiral position
        particle.position.x = x + radius * Math.cos(angle) * (1 + oscillation * 0.1);
        particle.position.y = y + radius * Math.sin(angle) * (1 + oscillation * 0.1);

        // Pulsing size effect
        particle.size = particle.size * (1 + Math.sin(age * Math.PI * 6) * 0.2);

        // Fade out as particles get further from center, but with a pulsing effect
        particle.color.a = Math.max(0, (1 - age * 1.5) * (0.8 + Math.sin(age * Math.PI * 8) * 0.2));
      }
    };

    // Start emitting
    particleSystem.start();

    return particleSystem;
  }

  // Handle power-up collection animation
  collectPowerUpEffect(powerUpId: number): void {
    const effect = this.effects.get(powerUpId);
    if (!effect) return;

    effect.collected = true;

    // Create explosion animation for particles
    const emitter = effect.particleSystem.emitter as Vector3;

    // Boost particle count for explosion effect
    effect.particleSystem.emitRate = 100;

    // Create a flash of particles at collection
    setTimeout(() => {
      // Stop emitting new particles after the initial burst
      effect.particleSystem.emitRate = 0;

      // Modify particle system for explosion effect
      effect.particleSystem.updateFunction = (particles) => {
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          const age = particle.age / particle.lifeTime;

          // Calculate a unique spiral pattern for this particle
          // Use the particle's index to create variation
          const particleOffset = (i % 10) * 0.1;

          // Spiral parameters
          const baseRadius = 1.8;
          const radius = baseRadius * (age + particleOffset);
          // Create a tighter spiral with more rotations
          const angle = age * Math.PI * 12 + particleOffset * Math.PI * 2;

          // Add a small oscillation to the spiral
          const oscillation = Math.sin(age * Math.PI * 4) * 0.2;

          // Calculate spiral position
          particle.position.x = emitter.x + radius * Math.cos(angle) * (1 + oscillation * 0.1);
          particle.position.y = emitter.y + radius * Math.sin(angle) * (1 + oscillation * 0.1);

          // Pulsing size effect
          particle.size = particle.size * (1 + Math.sin(age * Math.PI * 6) * 0.2);

          // Fade out as particles get further from center, but with a pulsing effect
          particle.color.a = Math.max(
            0,
            (1 - age * 1.5) * (0.8 + Math.sin(age * Math.PI * 8) * 0.2)
          );
        }
      };
    }, 100);

    // Animate center mesh for collection effect
    // 1. First create a quick pulse/flash
    const scaleAnim = new Animation(
      'powerUpCollectAnimation',
      'scaling',
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const scaleKeys = [
      { frame: 0, value: effect.centerMesh.scaling.clone() },
      { frame: 10, value: new Vector3(1.5, 1.5, 1.5) },
      { frame: 20, value: new Vector3(0, 0, 0) },
    ];
    scaleAnim.setKeys(scaleKeys);

    // 2. Create a bright flash
    const emissiveAnim = new Animation(
      'powerUpFlashAnimation',
      'material.emissiveColor',
      60,
      Animation.ANIMATIONTYPE_COLOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Base color
    const baseColor = this.primaryColor.clone();
    // Very bright white for flash
    const flashColor = new Color3(1, 1, 1);

    const emissiveKeys = [
      { frame: 0, value: baseColor },
      { frame: 5, value: flashColor },
      { frame: 15, value: baseColor },
    ];
    emissiveAnim.setKeys(emissiveKeys);

    // 3. Apply easing functions
    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    scaleAnim.setEasingFunction(easingFunction);

    // 4. Start animations
    effect.centerMesh.animations = [scaleAnim, emissiveAnim];

    // 5. Animate cubes for collection effect
    effect.cubes.forEach((cube) => {
      // Create a quick pulse/flash for cubes too
      const cubeScaleAnim = new Animation(
        `powerUpCubeCollectAnimation`,
        'scaling',
        60,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );

      const cubeScaleKeys = [
        { frame: 0, value: cube.scaling.clone() },
        { frame: 5, value: cube.scaling.scale(1.5) },
        { frame: 20, value: new Vector3(0, 0, 0) },
      ];
      cubeScaleAnim.setKeys(cubeScaleKeys);

      // Also make the cube emissive material flash
      if (cube.material instanceof StandardMaterial) {
        const cubeEmissiveAnim = new Animation(
          `powerUpCubeFlashAnimation`,
          'material.emissiveColor',
          60,
          Animation.ANIMATIONTYPE_COLOR3,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        // Base color
        const baseColor = this.primaryColor.clone();
        // Very bright white for flash
        const flashColor = new Color3(1, 1, 1);

        const cubeEmissiveKeys = [
          { frame: 0, value: baseColor },
          { frame: 5, value: flashColor },
          { frame: 15, value: baseColor },
        ];
        cubeEmissiveAnim.setKeys(cubeEmissiveKeys);

        cube.animations = [cubeScaleAnim, cubeEmissiveAnim];
      } else {
        cube.animations = [cubeScaleAnim];
      }

      // Stop the orbit animation
      if (cube.metadata && cube.metadata.observer) {
        this.scene.onBeforeRenderObservable.remove(cube.metadata.observer);
      }

      this.scene.beginAnimation(cube, 0, 20, false, 1);
    });

    this.scene.beginAnimation(effect.centerMesh, 0, 20, false, 1, () => {
      // Schedule cleanup after animation completes
      setTimeout(() => this.disposeEffect(powerUpId), 1500);
    });
  }

  // Clean up an effect completely
  disposeEffect(powerUpId: number): void {
    const effect = this.effects.get(powerUpId);
    if (!effect) return;

    // Dispose particle system
    effect.particleSystem.dispose();

    // Dispose center mesh and its materials
    if (effect.centerMesh.material) {
      effect.centerMesh.material.dispose();
    }
    effect.centerMesh.dispose();

    // Dispose cubes and their materials
    effect.cubes.forEach((cube) => {
      // Remove animation observer if exists
      if (cube.metadata && cube.metadata.observer) {
        this.scene.onBeforeRenderObservable.remove(cube.metadata.observer);
      }

      if (cube.material) {
        cube.material.dispose();
      }
      cube.dispose();
    });

    // Remove from effects map
    this.effects.delete(powerUpId);
  }

  // Update positions and visual effects based on remaining time
  updatePositions(powerUps: PowerUp[]): void {
    for (const powerUp of powerUps) {
      if (this.effects.has(powerUp.id) && !powerUp.collected) {
        const effect = this.effects.get(powerUp.id)!;

        // Convert to Babylon coordinate system
        const x = (powerUp.x - this.width / 2) / this.scaleFactor;
        const y = -((powerUp.y - this.height / 2) / this.scaleFactor);
        const basePosition = new Vector3(x, y, 0);

        // Update particle system emitter position
        (effect.particleSystem.emitter as Vector3).x = x;
        (effect.particleSystem.emitter as Vector3).y = y;

        // Update center mesh position
        effect.centerMesh.position.x = x;
        effect.centerMesh.position.y = y;

        // Scale visual effects based on remaining time
        if (powerUp.timeToDespawn !== undefined) {
          // Calculate the percentage of time remaining (0-1)
          const initialDuration = 8000; // Default from defaultGameParams.powerUpDuration
          const percentRemaining = powerUp.timeToDespawn / initialDuration;

          // Apply visual changes based on remaining time
          this.updateTimeBasedEffects(effect, percentRemaining);
        }
      }
    }
  }

  // Update visual effects based on remaining time percentage
  private updateTimeBasedEffects(effect: PowerUpEffect, percentRemaining: number): void {
    // Make effects more intense/faster as time runs out
    const urgencyFactor = Math.max(0.5, 2 - percentRemaining * 1.5); // Range: 0.5 (start) to 2.0 (end)

    // Update particle system
    if (percentRemaining < 0.3) {
      // When less than 30% time remains, increase particle rate for urgency
      effect.particleSystem.emitRate = 30 * urgencyFactor;

      // Pulse the icon size more dramatically when time is running out
      if (effect.centerMesh.animations && effect.centerMesh.animations.length > 0) {
        this.scene.stopAnimation(effect.centerMesh);

        // Create more intense pulsing animation
        const scaleXAnim = new Animation(
          'powerUpScaleXAnimation',
          'scaling.x',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const scaleYAnim = new Animation(
          'powerUpScaleYAnimation',
          'scaling.y',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CYCLE
        );

        const urgentScaleKeys = [
          { frame: 0, value: 0.5 },
          { frame: 15, value: 0.8 }, // More dramatic scale
          { frame: 30, value: 0.5 },
        ];

        scaleXAnim.setKeys(urgentScaleKeys);
        scaleYAnim.setKeys(urgentScaleKeys);

        // Apply the new animations
        effect.centerMesh.animations = [scaleXAnim, scaleYAnim];
        this.scene.beginAnimation(effect.centerMesh, 0, 30, true, 2 * urgencyFactor); // Faster animation
      }

      // Make the cubes spin faster as time runs out
      effect.cubes.forEach((cube) => {
        if (cube.material instanceof StandardMaterial) {
          // Increase cube color intensity as time runs out
          const material = cube.material as StandardMaterial;
          const baseColor = this.primaryColor.clone();
          material.emissiveColor = new Color3(
            Math.min(baseColor.r * urgencyFactor * 1.5, 1.0),
            Math.min(baseColor.g * urgencyFactor * 1.5, 1.0),
            Math.min(baseColor.b * urgencyFactor * 1.5, 1.0)
          );
        }
      });
    }
  }

  // Dispose all effects (for cleanup)
  disposeAll(): void {
    for (const [id] of this.effects) {
      this.disposeEffect(id);
    }
  }
}
