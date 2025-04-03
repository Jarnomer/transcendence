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
  private scaleFactor: number;
  private gameWidth: number;
  private gameHeight: number;
  private powerUpSize: number;

  constructor(
    scene: Scene,
    color: Color3,
    width: number,
    height: number,
    scaleFactor: number,
    powerUpSize: number
  ) {
    this.scene = scene;
    this.color = color;
    this.gameWidth = width;
    this.gameHeight = height;
    this.scaleFactor = scaleFactor;
    this.powerUpSize = powerUpSize;
  }

  // Check for new, collecter and removed power-ups
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
        this.disposeEffect(id);
      }
    }
  }

  private createPowerUpEffect(powerUp: PowerUp): void {
    const x = (powerUp.x - this.gameWidth / 2) / this.scaleFactor;
    const y = -((powerUp.y - this.gameHeight / 2) / this.scaleFactor);
    const basePosition = new Vector3(x, y, 0.2);

    const baseSize = this.powerUpSize / this.scaleFactor;
    const cubeSize = baseSize * 1.01;

    const centerMesh = this.createIconMesh(powerUp.type, x, y, baseSize);
    const cube = this.createCubeMesh(powerUp.id, basePosition, cubeSize, 0.6, this.color);
    const particleSystem = this.createSpiralParticle(powerUp.id, x, y, this.color);

    this.effects.set(powerUp.id, {
      id: powerUp.id,
      particleSystem,
      icon: centerMesh,
      cubes: [cube],
      type: powerUp.type,
      collected: false,
    });

    this.animatePowerUpIcon(centerMesh);
  }

  private createIconMesh(type: string, x: number, y: number, size: number): Mesh {
    const mesh = MeshBuilder.CreatePlane(
      `powerUpIcon-${type}`,
      { width: size * 1.15, height: size * 1.15 },
      this.scene
    );
    console.log(`size: ${size}`);
    mesh.position = new Vector3(x, y, 0.2);

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

  // Replace this with emissive glitter effect that explodes upon collection
  private createSpiralParticle(id: number, x: number, y: number, color: Color3): ParticleSystem {
    const particleSystem = new ParticleSystem(`powerUpParticles-${id}`, 150, this.scene);
    particleSystem.particleTexture = createParticleTexture(this.scene, color);
    particleSystem.emitter = new Vector3(x, y, 0);
    particleSystem.minEmitBox = new Vector3(-0.1, -0.1, 0);
    particleSystem.maxEmitBox = new Vector3(0.1, 0.1, 0);
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
    particleSystem.updateFunction = (particles) => {
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        const age = particle.age / particle.lifeTime;
        const particleOffset = (i % 10) * 0.1;
        const baseRadius = 1.8;
        const radius = baseRadius * (age + particleOffset);
        const angle = age * Math.PI * 12 + particleOffset * Math.PI * 2;
        const oscillation = Math.sin(age * Math.PI * 4) * 0.2;
        particle.position.x = x + radius * Math.cos(angle) * (1 + oscillation * 0.1);
        particle.position.y = y + radius * Math.sin(angle) * (1 + oscillation * 0.1);
        particle.size = particle.size * (1 + Math.sin(age * Math.PI * 6) * 0.2);
        particle.color.a = Math.max(0, (1 - age * 1.5) * (0.8 + Math.sin(age * Math.PI * 8) * 0.2));
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

    // Add hover animation
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
      { frame: 45, value: originalY + 0.4 },
      { frame: 90, value: originalY },
    ];
    positionAnim.setKeys(positionKeys);

    // Create emissive glow effect
    const emissiveAnim = new Animation(
      'powerUpEmissiveAnimation',
      'material.emissiveColor',
      30,
      Animation.ANIMATIONTYPE_COLOR3,
      Animation.ANIMATIONLOOPMODE_CYCLE
    );

    const baseColor = this.color.clone();
    const brightColor = new Color3(
      Math.min(baseColor.r * 2, 1.5),
      Math.min(baseColor.g * 2, 1.5),
      Math.min(baseColor.b * 2, 1.5)
    );
    const emissiveKeys = [
      { frame: 0, value: baseColor },
      { frame: 30, value: brightColor },
      { frame: 60, value: baseColor },
    ];
    emissiveAnim.setKeys(emissiveKeys);

    // Easing functions - smoother animations
    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    scaleXAnim.setEasingFunction(easingFunction);
    scaleYAnim.setEasingFunction(easingFunction);
    positionAnim.setEasingFunction(easingFunction);

    mesh.animations = [scaleXAnim, scaleYAnim, scaleZAnim, positionAnim, emissiveAnim];

    this.scene.beginAnimation(mesh, 0, 60, true);
  }

  collectPowerUpEffect(powerUpId: number): void {
    const effect = this.effects.get(powerUpId);
    if (!effect) return;

    effect.collected = true;

    // Replace this with glitter effect explosion
    const emitter = effect.particleSystem.emitter as Vector3;
    effect.particleSystem.emitRate = 100;
    setTimeout(() => {
      effect.particleSystem.emitRate = 0;
      effect.particleSystem.updateFunction = (particles) => {
        for (let i = 0; i < particles.length; i++) {
          const particle = particles[i];
          const age = particle.age / particle.lifeTime;
          const particleOffset = (i % 10) * 0.1;
          const baseRadius = 1.8;
          const radius = baseRadius * (age + particleOffset);
          const angle = age * Math.PI * 12 + particleOffset * Math.PI * 2;
          const oscillation = Math.sin(age * Math.PI * 4) * 0.2;
          particle.position.x = emitter.x + radius * Math.cos(angle) * (1 + oscillation * 0.1);
          particle.position.y = emitter.y + radius * Math.sin(angle) * (1 + oscillation * 0.1);
          particle.size = particle.size * (1 + Math.sin(age * Math.PI * 6) * 0.2);
          particle.color.a = Math.max(0, (1 - age) * (0.8 + Math.sin(age * Math.PI * 8) * 0.2));
        }
      };
    }, 100);

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

    this.scene.beginAnimation(effect.icon, 0, 20, false, 1, () => {
      setTimeout(() => this.disposeEffect(powerUpId), 1000);
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
    for (const [id] of this.effects) {
      this.disposeEffect(id);
    }
  }
}
