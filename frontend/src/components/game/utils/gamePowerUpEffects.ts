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

import { PowerUp, defaultGameObjectParams } from '@shared/types';

import { createParticleTexture } from './gamePostProcess';
import { gameToSceneSize, gameToSceneX, gameToSceneY } from './gameUtilities';

interface PowerUpEffect {
  id: number;
  particleSystem: ParticleSystem;
  icon: Mesh;
  cubes: Mesh[];
  type: string;
  collected: boolean;
}

export class PowerUpEffectsManager {
  private scene: Scene;
  private effects: Map<number, PowerUpEffect> = new Map();
  private color: Color3;
  private powerUpSize: number;

  constructor(scene: Scene, color: Color3, powerUpSize: number) {
    this.scene = scene;
    this.color = color;
    this.powerUpSize = powerUpSize;
  }

  // Check for new, collected and removed power-ups
  updatePowerUpEffects(powerUps: PowerUp[]): void {
    for (const powerUp of powerUps) {
      if (!this.effects.has(powerUp.id) && !powerUp.collected) {
        this.createPowerUpEffect(powerUp);
      } else if (
        this.effects.has(powerUp.id) &&
        powerUp.collected &&
        !this.effects.get(powerUp.id)!.collected
      ) {
        this.collectPowerUpEffect(powerUp.id);
      }
    }

    const currentIds = new Set(powerUps.map((p) => p.id));
    for (const [id, effect] of this.effects.entries()) {
      if (!currentIds.has(id) && !effect.collected) {
        this.disposeEffectWithAnimation(id);
      }
    }
  }

  private createPowerUpEffect(powerUp: PowerUp): void {
    const baseSize = gameToSceneSize(this.powerUpSize);
    const cubeSize = baseSize * 1.01;

    const icon = this.createIconMesh(powerUp.type, baseSize);

    const x = gameToSceneX(powerUp.x, icon);
    const y = gameToSceneY(powerUp.y, icon);
    const basePosition = new Vector3(x, y, defaultGameObjectParams.distanceFromFloor);

    icon.position = basePosition.clone();

    const cube = this.createCubeMesh(powerUp.id, basePosition, cubeSize, 0.6, this.color);
    const particleSystem = this.createGlitterParticleSystem(powerUp.id, x, y, this.color);

    this.effects.set(powerUp.id, {
      id: powerUp.id,
      particleSystem,
      icon: icon,
      cubes: [cube],
      type: powerUp.type,
      collected: false,
    });

    this.animatePowerUpIcon(icon);
  }

  private createIconMesh(type: string, size: number): Mesh {
    const mesh = MeshBuilder.CreatePlane(
      `powerUpIcon-${type}`,
      { width: size, height: size },
      this.scene
    );
    const material = new StandardMaterial(`powerUpMaterial-${type}`, this.scene);
    const iconPath = this.getPowerUpIconPath(type);
    const texture = new Texture(iconPath, this.scene);

    material.emissiveColor = this.color;
    material.disableLighting = true;
    material.diffuseTexture = texture;
    material.opacityTexture = texture;
    material.useAlphaFromDiffuseTexture = true;

    mesh.scaling = new Vector3(0.5, 0.5, 0.5);
    mesh.material = material;

    return mesh;
  }

  private getPowerUpIconPath(type: string): string {
    switch (type) {
      case 'bigger_paddle':
        return '/power-up/paddle_bigger.png';
      case 'smaller_paddle':
        return '/power-up/paddle_smalller.png';
      default:
        return '/power-up/paddle_bigger.png';
    }
  }

  private createCubeMesh(
    powerUpId: number,
    basePosition: Vector3,
    size: number,
    transparency: number,
    color: Color3
  ): Mesh {
    const cube = MeshBuilder.CreateBox(
      `powerUpCube-${powerUpId}-${size}`,
      { size: size },
      this.scene
    );

    const material = new StandardMaterial(`powerUpCubeMaterial-${powerUpId}-${size}`, this.scene);

    material.emissiveColor = color;
    material.alpha = transparency;
    material.wireframe = true;
    material.useAlphaFromDiffuseTexture = true;
    material.backFaceCulling = false;
    material.disableLighting = true;

    cube.position = basePosition.clone();
    cube.material = material;

    this.animateCubeRotation(cube, basePosition);

    return cube;
  }

  private animateCubeRotation(cube: Mesh, centerPosition: Vector3): void {
    const rotationSpeedX = Math.random() * 0.025;
    const rotationSpeedY = Math.random() * 0.025;
    const rotationSpeedZ = Math.random() * 0.025;

    cube.rotation.x = Math.random() * Math.PI;
    cube.rotation.y = Math.random() * Math.PI;
    cube.rotation.z = Math.random() * Math.PI;

    let elapsedTime = 0;

    const observer = this.scene.onBeforeRenderObservable.add(() => {
      const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
      elapsedTime += deltaTime;

      cube.position.x = centerPosition.x;
      cube.position.y = centerPosition.y + 0.1;
      cube.position.z = centerPosition.z + 0.1;

      cube.rotation.x += rotationSpeedX;
      cube.rotation.y += rotationSpeedY;
      cube.rotation.z += rotationSpeedZ;
    });

    cube.metadata = { observer, elapsedTime };
  }

  private createGlitterParticleSystem(
    id: number,
    x: number,
    y: number,
    color: Color3
  ): ParticleSystem {
    const particleSystem = new ParticleSystem(`powerUpParticles-${id}`, 200, this.scene);

    particleSystem.particleTexture = createParticleTexture(this.scene, color);

    particleSystem.emitter = new Vector3(x, y, defaultGameObjectParams.distanceFromFloor);

    const emitBoxSize = 0.03;
    particleSystem.minEmitBox = new Vector3(-emitBoxSize, -emitBoxSize, -emitBoxSize);
    particleSystem.maxEmitBox = new Vector3(emitBoxSize, emitBoxSize, emitBoxSize);

    particleSystem.color1 = new Color4(color.r, color.g, color.b, 0.8);

    particleSystem.emitRate = 10;
    particleSystem.minSize = 0.05;
    particleSystem.maxSize = 0.2;
    particleSystem.minLifeTime = 0.05;
    particleSystem.maxLifeTime = 0.2;
    particleSystem.minEmitPower = 0.05;
    particleSystem.maxEmitPower = 0.25;

    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    particleSystem.direction1 = new Vector3(-0.5, -0.5, -0.25);
    particleSystem.direction2 = new Vector3(0.5, 0.5, 0.25);

    const creationTime = Date.now();
    const maxLifetime = 8000;

    const cubeSize = gameToSceneSize(this.powerUpSize) * 1.01;

    particleSystem.updateFunction = (particles) => {
      const lifetimeProgress = Math.min((Date.now() - creationTime) / maxLifetime, 1);

      if (particleSystem.emitRate !== 0 && lifetimeProgress % 0.1 < 0.01) {
        particleSystem.emitRate = 10 + Math.floor(lifetimeProgress * 15);
      }

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        const age = particle.age / particle.lifeTime;
        const baseAngle = (i * 137.5) % 360;
        const speed = 0.004 * (1.0 - age * 0.3);

        const deltaX = Math.cos(baseAngle) * speed * (1 + ((i % 5) - 2) * 0.1);
        const deltaY = Math.sin(baseAngle) * speed * (1 + ((i % 7) - 3) * 0.1);

        particle.color.a = Math.max(0, 1 - age);

        const nextX = particle.position.x + deltaX;
        const nextY = particle.position.y + deltaY;
        const distanceFromCenter = Math.sqrt(Math.pow(nextX - x, 2) + Math.pow(nextY - y, 2));

        if (distanceFromCenter <= cubeSize * 1.1) {
          particle.position.x += deltaX;
          particle.position.y += deltaY;
        } else {
          particle.position.x = x + (Math.random() - 0.5) * emitBoxSize * 2;
          particle.position.y = y + (Math.random() - 0.5) * emitBoxSize * 2;
        }
      }
    };

    particleSystem.start();
    return particleSystem;
  }

  private animatePowerUpIcon(mesh: Mesh): void {
    const scaleXAnim = new Animation(
      'powerUpScaleXAnimation',
      'scaling.x',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const scaleXKeys = [
      { frame: 0, value: 0.5 },
      { frame: 30, value: 0.7 },
      { frame: 60, value: 0.5 },
    ];
    scaleXAnim.setKeys(scaleXKeys);

    const scaleYAnim = new Animation(
      'powerUpScaleYAnimation',
      'scaling.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const scaleYKeys = [
      { frame: 0, value: 0.5 },
      { frame: 15, value: 0.6 },
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

    const positionAnim = new Animation(
      'powerUpHoverAnimation',
      'position.y',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const originalY = mesh.position.y;
    const positionKeys = [
      { frame: 0, value: originalY },
      { frame: 15, value: originalY + 0.05 },
      { frame: 45, value: originalY - 0.05 },
      { frame: 60, value: originalY },
    ];
    positionAnim.setKeys(positionKeys);

    // Easing functions - smoother animations
    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    scaleXAnim.setEasingFunction(easingFunction);
    scaleYAnim.setEasingFunction(easingFunction);
    positionAnim.setEasingFunction(easingFunction);

    mesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim, positionAnim];

    this.scene.beginAnimation(mesh, 0, 60, true);
  }

  collectPowerUpEffect(powerUpId: number): void {
    const effect = this.effects.get(powerUpId);
    if (!effect) return;

    effect.collected = true;

    // Animate icon scaling
    const scaleAnim = new Animation(
      'powerUpCollectAnimation',
      'scaling',
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const scaleKeys = [
      { frame: 0, value: effect.icon.scaling.clone() },
      { frame: 10, value: new Vector3(1.5, 1.5, 1.5) },
      { frame: 20, value: new Vector3(0, 0, 0) },
    ];
    scaleAnim.setKeys(scaleKeys);

    // Animate flash emission
    const emissiveAnim = new Animation(
      'powerUpFlashAnimation',
      'material.emissiveColor',
      60,
      Animation.ANIMATIONTYPE_COLOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const baseColor = this.color.clone();
    const flashColor = new Color3(2, 1, 1);
    const emissiveKeys = [
      { frame: 0, value: baseColor },
      { frame: 5, value: flashColor },
      { frame: 15, value: baseColor },
    ];
    emissiveAnim.setKeys(emissiveKeys);

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    scaleAnim.setEasingFunction(easingFunction);

    effect.icon.animations = [scaleAnim, emissiveAnim];

    // Animate all rotation cubes
    effect.cubes.forEach((cube) => {
      // Animate cube scaling
      const cubeScaleAnim = new Animation(
        `powerUpCubeCollectAnimation`,
        'scaling',
        60,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      const cubeScaleKeys = [
        { frame: 0, value: cube.scaling.clone() },
        { frame: 10, value: cube.scaling.scale(1.8) },
        { frame: 30, value: new Vector3(0, 0, 0) },
      ];
      cubeScaleAnim.setKeys(cubeScaleKeys);

      // Animate flash emission
      const cubeEmissiveAnim = new Animation(
        `powerUpCubeFlashAnimation`,
        'material.emissiveColor',
        60,
        Animation.ANIMATIONTYPE_COLOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      const baseColor = this.color.clone();
      const flashColor = new Color3(1, 1, 1);
      const cubeEmissiveKeys = [
        { frame: 0, value: baseColor },
        { frame: 5, value: flashColor },
        { frame: 15, value: baseColor },
      ];
      cubeEmissiveAnim.setKeys(cubeEmissiveKeys);

      cube.animations = [cubeScaleAnim, cubeEmissiveAnim];

      // Stop the orbit animation
      if (cube.metadata && cube.metadata.observer) {
        this.scene.onBeforeRenderObservable.remove(cube.metadata.observer);
      }

      this.scene.beginAnimation(cube, 0, 20, false, 1);
    });

    // Handle particle fadeout
    if (effect.particleSystem) {
      effect.particleSystem.emitRate = 0;

      const startTime = Date.now();
      const fadeOutDuration = 400;

      const originalUpdateFn = effect.particleSystem.updateFunction;
      effect.particleSystem.updateFunction = (particles) => {
        // Call the original update function if it exists
        if (originalUpdateFn) originalUpdateFn(particles);

        const progress = Math.min((Date.now() - startTime) / fadeOutDuration, 1);
        const fadeOutFactor = 1 - progress;

        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          particle.color.a *= fadeOutFactor;
          particle.size *= fadeOutFactor;
        }
      };
    }

    this.scene.beginAnimation(effect.icon, 0, 20, false, 1, () => {
      setTimeout(() => this.disposeEffect(powerUpId), 1000);
    });
  }

  disposeEffectWithAnimation(powerUpId: number): void {
    const effect = this.effects.get(powerUpId);
    if (!effect) return;

    // If already collected, just dispose normally
    if (effect.collected) {
      this.disposeEffect(powerUpId);
      return;
    }

    effect.collected = true;

    // Animate icon scaling
    const scaleAnim = new Animation(
      'powerUpDisposeAnimation',
      'scaling',
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const scaleKeys = [
      { frame: 0, value: effect.icon.scaling.clone() },
      { frame: 15, value: new Vector3(0, 0, 0) },
    ];
    scaleAnim.setKeys(scaleKeys);

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    scaleAnim.setEasingFunction(easingFunction);

    effect.icon.animations = [scaleAnim];

    // Animate all rotation cubes
    effect.cubes.forEach((cube) => {
      // Animate cube scaling
      const cubeScaleAnim = new Animation(
        `powerUpCubeDisposeAnimation`,
        'scaling',
        60,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CONSTANT
      );
      const cubeScaleKeys = [
        { frame: 0, value: cube.scaling.clone() },
        { frame: 15, value: new Vector3(0, 0, 0) },
      ];
      cubeScaleAnim.setKeys(cubeScaleKeys);
      cubeScaleAnim.setEasingFunction(easingFunction);

      cube.animations = [cubeScaleAnim];

      // Stop the orbit animation
      if (cube.metadata && cube.metadata.observer) {
        this.scene.onBeforeRenderObservable.remove(cube.metadata.observer);
      }

      this.scene.beginAnimation(cube, 0, 15, false, 1);
    });

    // Animate the particle system
    if (effect.particleSystem) {
      effect.particleSystem.emitRate = 0;

      const startTime = Date.now();
      const fadeOutDuration = 400;

      const originalUpdateFn = effect.particleSystem.updateFunction;
      effect.particleSystem.updateFunction = (particles) => {
        if (originalUpdateFn) originalUpdateFn(particles);

        // Apply smooth fade-out to all particles
        const progress = Math.min((Date.now() - startTime) / fadeOutDuration, 1);
        const fadeOutFactor = 1 - progress;

        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          particle.color.a *= fadeOutFactor;
          particle.size *= fadeOutFactor;
        }
      };
    }

    this.scene.beginAnimation(effect.icon, 0, 15, false, 1, () => {
      setTimeout(() => {
        this.disposeEffect(powerUpId);
      }, 400);
    });
  }

  // Clean up the effects completely
  disposeEffect(powerUpId: number): void {
    const effect = this.effects.get(powerUpId);
    if (!effect) return;

    effect.particleSystem.dispose();

    if (effect.icon.material) {
      effect.icon.material.dispose();
    }
    effect.icon.dispose();

    effect.cubes.forEach((cube) => {
      if (cube.metadata && cube.metadata.observer) {
        this.scene.onBeforeRenderObservable.remove(cube.metadata.observer);
      }
      if (cube.material) {
        cube.material.dispose();
      }
      cube.dispose();
    });

    this.effects.delete(powerUpId);
  }

  disposeAll(): void {
    for (const [id, effect] of this.effects.entries()) {
      if (!effect.collected) {
        this.disposeEffectWithAnimation(id);
      } else {
        this.disposeEffect(id);
      }
    }
  }
}
