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

  constructor(
    scene: Scene,
    primaryColor: Color3,
    width: number,
    height: number,
    scaleFactor: number
  ) {
    this.scene = scene;
    this.primaryColor = primaryColor;
    this.width = width;
    this.height = height;
    this.scaleFactor = scaleFactor;
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

    // Create center mesh with power-up icon
    const centerMesh = this.createPowerUpMesh(powerUp.type, x, y);

    // Create particle system for spiral effect
    const particleSystem = this.createSpiralParticleSystem(powerUp.id, x, y, this.primaryColor);

    // Store the effect
    this.effects.set(powerUp.id, {
      id: powerUp.id,
      particleSystem,
      centerMesh,
      type: powerUp.type,
      collected: false,
    });

    // Start animations
    this.animatePowerUpMesh(centerMesh);
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

  // Animate power-up mesh (pulsing, rotating, and hover effect)
  private animatePowerUpMesh(mesh: Mesh): void {
    // Create more dynamic scaling animation
    const scaleAnim = new Animation(
      'powerUpScaleAnimation',
      'scaling',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Define scaling keyframes with more variation
    const scaleKeys = [
      { frame: 0, value: new Vector3(0.5, 0.5, 0.5) },
      { frame: 15, value: new Vector3(0.58, 0.58, 0.58) },
      { frame: 30, value: new Vector3(0.65, 0.65, 0.65) },
      { frame: 45, value: new Vector3(0.58, 0.58, 0.58) },
      { frame: 60, value: new Vector3(0.5, 0.5, 0.5) },
    ];
    scaleAnim.setKeys(scaleKeys);

    // Create rotation animation - faster rotation
    const rotationAnim = new Animation(
      'powerUpRotationAnimation',
      'rotation.z',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    // Define rotation keyframes
    const rotationKeys = [
      { frame: 0, value: 0 },
      { frame: 90, value: Math.PI * 2 },
    ];
    rotationAnim.setKeys(rotationKeys);

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
    scaleAnim.setEasingFunction(easingFunction);
    positionAnim.setEasingFunction(easingFunction);

    // Start animations
    mesh.animations = [scaleAnim, rotationAnim, positionAnim, emissiveAnim];
    this.scene.beginAnimation(mesh, 0, 60, true);
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

          // Make particles move faster as they age
          const speedMultiplier = 1 + age * 3;

          // Accelerate existing particles outward in all directions
          const dirX = particle.position.x - emitter.x;
          const dirY = particle.position.y - emitter.y;
          const length = Math.sqrt(dirX * dirX + dirY * dirY);

          if (length > 0.01) {
            const normalizedDirX = dirX / length;
            const normalizedDirY = dirY / length;

            // Move particles outward with increasing speed
            particle.position.x += normalizedDirX * 0.3 * speedMultiplier;
            particle.position.y += normalizedDirY * 0.3 * speedMultiplier;

            // Add some spiral rotation to the particles as they fly outward
            const rotationAngle = age * Math.PI * 2;
            const rotationRadius = 0.1 * age;
            particle.position.x += Math.cos(rotationAngle) * rotationRadius;
            particle.position.y += Math.sin(rotationAngle) * rotationRadius;
          }

          // Make particles grow slightly as they explode outward
          particle.size = particle.size * (1 + age * 0.5);

          // Fade out particles faster with some variation
          particle.color.a = Math.max(0, 1 - age * (3 + Math.random()));
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

    // Remove from effects map
    this.effects.delete(powerUpId);
  }

  // Update positions of existing effects
  updatePositions(powerUps: PowerUp[]): void {
    for (const powerUp of powerUps) {
      if (this.effects.has(powerUp.id) && !powerUp.collected) {
        const effect = this.effects.get(powerUp.id)!;

        // Convert to Babylon coordinate system
        const x = (powerUp.x - this.width / 2) / this.scaleFactor;
        const y = -((powerUp.y - this.height / 2) / this.scaleFactor);

        // Update particle system emitter position
        (effect.particleSystem.emitter as Vector3).x = x;
        (effect.particleSystem.emitter as Vector3).y = y;

        // Update center mesh position
        effect.centerMesh.position.x = x;
        effect.centerMesh.position.y = y;
      }
    }
  }

  // Dispose all effects (for cleanup)
  disposeAll(): void {
    for (const [id] of this.effects) {
      this.disposeEffect(id);
    }
  }
}
