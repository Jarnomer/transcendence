import {
  Animation,
  Color3,
  Color4,
  CubicEase,
  EasingFunction,
  GlowLayer,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  ParticleSystem,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from 'babylonjs';

import {
  gameToSceneSize,
  getPowerUpSignPath,
  getPowerUpIconPath,
  addGlowEffect,
  createStandardParticleSystem,
} from '@game/utils';

import {
  Player,
  PlayerEffects,
  PowerUpEffect,
  PowerUpType,
  defaultGameObjectParams,
  playerPowerUp,
} from '@shared/types';

export function applyPlayerEffects(
  scene: Scene,
  player1Mesh: Mesh,
  player2Mesh: Mesh,
  players: { player1: Player; player2: Player },
  primaryColor: Color3,
  secondaryColor: Color3,
  effectsMap: Map<number, PlayerEffects> | null
): void {
  if (!effectsMap) return;

  applyPaddleEffects(
    scene,
    player1Mesh,
    players.player1,
    primaryColor,
    secondaryColor,
    1,
    effectsMap
  );
  applyPaddleEffects(
    scene,
    player2Mesh,
    players.player2,
    primaryColor,
    secondaryColor,
    2,
    effectsMap
  );
}

function applyPaddleEffects(
  scene: Scene,
  paddleMesh: Mesh,
  player: Player,
  primaryColor: Color3,
  secondaryColor: Color3,
  playerIndex: number,
  effectsMap: Map<number, PlayerEffects>
): void {
  if (!effectsMap.has(playerIndex)) {
    effectsMap.set(playerIndex, {
      paddleHeight: player.paddleHeight,
      activeEffects: new Map(),
    });
  } else {
    const playerEffects = effectsMap.get(playerIndex)!;

    if (playerEffects.paddleHeight !== player.paddleHeight) {
      playerEffects.paddleHeight = player.paddleHeight;
      animatePaddleResize(scene, paddleMesh, player.paddleHeight);
    }
  }

  const playerEffects = effectsMap.get(playerIndex)!;
  const currentEffectTypes = new Set(player.activePowerUps.map((p) => p.type));

  const hadEffects = playerEffects.activeEffects.size > 0;
  const hasNoEffectsNow = player.activePowerUps.length === 0;

  if (hadEffects && hasNoEffectsNow) {
    clearAllPlayerEffects(scene, paddleMesh, playerEffects, primaryColor);
    return;
  }

  // Check for new power up effects
  for (const powerUp of player.activePowerUps) {
    const effectColor = powerUp.isNegative ? secondaryColor : primaryColor;
    const effectKey = powerUp.type;

    if (!playerEffects.activeEffects.has(effectKey)) {
      const { particleSystem, glowLayer, icons } = createPowerUpVisualEffects(
        scene,
        paddleMesh,
        powerUp.type,
        effectColor,
        playerIndex,
        // Use size to increment effects
        playerEffects.activeEffects.size
      );

      playerEffects.activeEffects.set(effectKey, {
        type: powerUp.type,
        particleSystem,
        glowLayer,
        icons,
      });

      applyPaddleMaterial(paddleMesh, player.activePowerUps, primaryColor, secondaryColor);
    }
  }

  // Check and dispose expired effects
  const expiredEffects: string[] = [];
  playerEffects.activeEffects.forEach((_: PowerUpEffect, type: string) => {
    if (!currentEffectTypes.has(type as PowerUpType)) {
      expiredEffects.push(type);
    }
  });

  for (const expiredEffect of expiredEffects) {
    const effect = playerEffects.activeEffects.get(expiredEffect)!;
    if (effect.particleSystem) disposeParticleWithAnimation(effect.particleSystem, paddleMesh);
    if (effect.glowLayer) effect.glowLayer.dispose();
    playerEffects.activeEffects.delete(expiredEffect);
    animatePaddleResize(scene, paddleMesh, player.paddleHeight);
  }
}

function createPowerUpVisualEffects(
  scene: Scene,
  paddleMesh: Mesh,
  powerUpType: PowerUpType,
  effectColor: Color3,
  playerIndex: number,
  effectIndex: number
): { particleSystem: ParticleSystem; glowLayer: GlowLayer; icons: Mesh[] } {
  const glowLayer = addGlowEffect(
    `powerUpGlow-${playerIndex}-${powerUpType}`,
    paddleMesh,
    scene,
    Math.max(0.2, 0.4 - effectIndex * 0.05),
    48
  );

  const particleSystem = createPowerUpParticles(
    scene,
    paddleMesh,
    powerUpType,
    effectColor,
    playerIndex,
    effectIndex
  );

  const icons = createPowerUpIconEffects(scene, paddleMesh, powerUpType, effectColor, playerIndex);

  return { particleSystem, glowLayer, icons };
}

function createPowerUpIconEffects(
  scene: Scene,
  paddleMesh: Mesh,
  powerUpType: PowerUpType,
  effectColor: Color3,
  playerIndex: number
): Mesh[] {
  const offset = 2.5;
  const xOffset = playerIndex === 1 ? offset : -offset;

  const iconUp = createPowerUpIconMesh(
    scene,
    powerUpType,
    paddleMesh,
    effectColor,
    xOffset,
    `up-${playerIndex}`
  );

  const iconDown = createPowerUpIconMesh(
    scene,
    powerUpType,
    paddleMesh,
    effectColor,
    xOffset,
    `down-${playerIndex}`
  );

  const icons = [iconUp, iconDown];

  animatePowerUpIcons(scene, icons, paddleMesh, effectColor);

  return icons;
}

function createPowerUpIconMesh(
  scene: Scene,
  powerUpType: PowerUpType,
  paddleMesh: Mesh,
  effectColor: Color3,
  xOffset: number,
  suffix: string
): Mesh {
  const iconSize = 3;
  const icon = MeshBuilder.CreatePlane(
    `powerUpIcon-${powerUpType}-${suffix}`,
    { width: iconSize, height: iconSize },
    scene
  );

  const material = new StandardMaterial(`powerUpIconMaterial-${powerUpType}-${suffix}`, scene);
  const iconPath = getPowerUpIconPath(powerUpType);
  const texture = new Texture(iconPath, scene);
  const paddlePosition = paddleMesh.position.clone();

  material.emissiveColor = effectColor;
  material.diffuseTexture = texture;
  material.opacityTexture = texture;

  material.useAlphaFromDiffuseTexture = true;
  material.disableLighting = true;

  icon.material = material;
  icon.isPickable = false;

  icon.position = new Vector3(paddlePosition.x + xOffset, paddlePosition.y, paddlePosition.z);
  icon.scaling = new Vector3(0, 0, 0);

  return icon;
}

function createPowerUpParticles(
  scene: Scene,
  paddleMesh: Mesh,
  powerUpType: PowerUpType,
  color: Color3,
  playerIndex: number,
  effectIndex: number
): ParticleSystem {
  const texturePath = getPowerUpSignPath(powerUpType);
  const paddlePosition = paddleMesh.position.clone();

  const options = {
    color: color,
    capacity: 40,
    emitRate: Math.max(6, 12 - effectIndex * 2),
    minSize: 0.5 - effectIndex * 0.05,
    maxSize: 1.5 - effectIndex * 0.1,
    minLifeTime: 3,
    maxLifeTime: 5,
    minEmitPower: 4,
    maxEmitPower: 8,
  };

  const particleSystem = createStandardParticleSystem(
    `powerUpParticles-${playerIndex}-${powerUpType}`,
    scene,
    paddlePosition.clone(),
    options,
    texturePath
  );

  particleSystem.minEmitBox = new Vector3(-0.2, -0.3, -0.2);
  particleSystem.maxEmitBox = new Vector3(0.2, 0.3, 0.2);

  particleSystem.createDirectedCylinderEmitter(
    0.25,
    0.15,
    0.1,
    new Vector3(0, 1, 0),
    new Vector3(0, 6, 0)
  );

  particleSystem.direction1 = new Vector3(-0.5, 1, -0.5);
  particleSystem.direction2 = new Vector3(0.5, 1, 0.5);

  particleSystem.minAngularSpeed = -0.3;
  particleSystem.maxAngularSpeed = 0.3;

  scene.onBeforeRenderObservable.add(() => {
    (particleSystem.emitter as Vector3).y = paddleMesh.position.y;
  });

  particleSystem.start();

  return particleSystem;
}

function animatePowerUpIcons(
  scene: Scene,
  icons: Mesh[],
  paddleMesh: Mesh,
  effectColor: Color3
): void {
  if (icons.length !== 2) return;

  const [iconUp, iconDown] = icons;
  const paddlePosition = paddleMesh.position.clone();

  const startPosition = new Vector3(iconUp.position.x, paddlePosition.y, iconUp.position.z);
  let endPosition;

  // Animate up position
  const posUpAnim = new Animation(
    'iconUpPositionAnimation',
    'position',
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  endPosition = new Vector3(iconUp.position.x, paddlePosition.y + 2, iconUp.position.z);
  const upPosKeys = [
    { frame: 0, value: startPosition },
    { frame: 60, value: endPosition },
  ];
  posUpAnim.setKeys(upPosKeys);

  // Animate down position
  const posDownAnim = new Animation(
    'iconDownPositionAnimation',
    'position',
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  endPosition = new Vector3(iconUp.position.x, paddlePosition.y - 2, iconUp.position.z);
  const downPosKeys = [
    { frame: 0, value: startPosition },
    { frame: 60, value: endPosition },
  ];
  posDownAnim.setKeys(downPosKeys);

  // Animate scaling
  const scaleAnim = new Animation(
    'iconScaleAnimation',
    'scaling',
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const scaleKeys = [
    { frame: 0, value: new Vector3(0, 0, 0) },
    { frame: 10, value: new Vector3(0.5, 0.5, 0.5) },
    { frame: 20, value: new Vector3(1.2, 1.2, 1.2) },
    { frame: 30, value: new Vector3(1, 1, 1) },
  ];
  scaleAnim.setKeys(scaleKeys);

  // Animate opacity
  const opacityAnim = new Animation(
    'iconOpacityAnimation',
    'material.alpha',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const opacityKeys = [
    { frame: 0, value: 0 },
    { frame: 20, value: 1 },
    { frame: 30, value: 1 },
    { frame: 40, value: 0 },
  ];
  opacityAnim.setKeys(opacityKeys);

  // Animate color
  const flashColor = new Color3(2, 1, 1);
  const colorAnim = new Animation(
    'iconColorAnimation',
    'material.emissiveColor',
    30,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const colorKeys = [
    { frame: 0, value: effectColor },
    { frame: 20, value: effectColor },
    { frame: 25, value: flashColor },
    { frame: 30, value: effectColor },
  ];
  colorAnim.setKeys(colorKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

  scaleAnim.setEasingFunction(easingFunction);
  posUpAnim.setEasingFunction(easingFunction);
  posDownAnim.setEasingFunction(easingFunction);
  opacityAnim.setEasingFunction(easingFunction);

  iconUp.animations = [scaleAnim.clone(), posUpAnim, opacityAnim.clone(), colorAnim.clone()];
  iconDown.animations = [scaleAnim.clone(), posDownAnim, opacityAnim.clone(), colorAnim.clone()];

  scene.beginAnimation(iconUp, 0, 60, false, 1, () => {
    if (iconUp.material) iconUp.material.dispose();
    iconUp.dispose();
  });

  scene.beginAnimation(iconDown, 0, 60, false, 1, () => {
    if (iconDown.material) iconDown.material.dispose();
    iconDown.dispose();
  });
}

function applyPaddleMaterial(
  paddleMesh: Mesh,
  activePowerUps: playerPowerUp[],
  primaryColor: Color3,
  secondaryColor: Color3
): void {
  if (!paddleMesh.material) return;

  const baseEmissive = defaultGameObjectParams.paddle.emissiveIntensity;

  if (activePowerUps.length === 0) {
    animateMaterialTransition(paddleMesh, primaryColor, baseEmissive);
    return;
  }

  const positiveEffects = activePowerUps.filter((p) => !p.isNegative).length;
  const negativeEffects = activePowerUps.filter((p) => p.isNegative).length;

  let effectColor: Color3 = primaryColor;

  if (positiveEffects > 0 && negativeEffects > 0) {
    const ratio = positiveEffects / (positiveEffects + negativeEffects);
    effectColor = Color3.Lerp(secondaryColor, primaryColor, ratio);
  } else if (negativeEffects > 0) {
    effectColor = secondaryColor;
  }

  const totalEffects = positiveEffects + negativeEffects;
  const intensityMultiplier = 1.2 + Math.min(totalEffects * 0.2, 0.8);
  const targetIntensity = baseEmissive * intensityMultiplier;

  animateMaterialTransition(paddleMesh, effectColor, targetIntensity);
}

function animateMaterialTransition(mesh: Mesh, targetColor: Color3, targetIntensity: number): void {
  if (!mesh.material) return;

  const scene = mesh.getScene();
  const material = mesh.material as PBRMaterial;

  const startColor = material.emissiveColor.clone();
  const startIntensity = material.emissiveIntensity;

  scene.stopAnimation(material);

  // Animate color
  const colorAnim = new Animation(
    'materialColorAnimation',
    'emissiveColor',
    30,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const colorKeys = [
    { frame: 0, value: startColor },
    { frame: 60, value: targetColor },
  ];
  colorAnim.setKeys(colorKeys);

  // Animate intensity
  const intensityAnim = new Animation(
    'materialIntensityAnimation',
    'emissiveIntensity',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const intensityKeys = [
    { frame: 0, value: startIntensity },
    { frame: 60, value: targetIntensity },
  ];
  intensityAnim.setKeys(intensityKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  colorAnim.setEasingFunction(easingFunction);
  intensityAnim.setEasingFunction(easingFunction);

  material.animations = [colorAnim, intensityAnim];

  scene.beginAnimation(material, 0, 60, false, 1, () => {
    material.emissiveColor = targetColor.clone();
    material.emissiveIntensity = targetIntensity;
  });
}

function animatePaddleResize(scene: Scene, paddleMesh: Mesh, targetHeight: number): void {
  const originalHeight = paddleMesh.getBoundingInfo().boundingBox.extendSize.y * 2;
  const scaledHeight = gameToSceneSize(targetHeight) / originalHeight;

  const originalScaleX = paddleMesh.scaling.x;
  const originalScaleZ = paddleMesh.scaling.z;

  let overshootMultiplier: number;
  let dampingMultiplier: number;

  if (paddleMesh.scaling.y < scaledHeight) {
    overshootMultiplier = 1.3;
    dampingMultiplier = 1.1;
  } else {
    overshootMultiplier = 0.7;
    dampingMultiplier = 0.9;
  }

  // Animate height
  const scaleYAnim = new Animation(
    'paddleResizeAnimationY',
    'scaling.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const scaleYKeys = [
    { frame: 0, value: paddleMesh.scaling.y },
    { frame: 5, value: scaledHeight * overshootMultiplier },
    { frame: 15, value: scaledHeight * dampingMultiplier },
    { frame: 30, value: scaledHeight },
  ];
  scaleYAnim.setKeys(scaleYKeys);

  // Animate width
  const scaleXAnim = new Animation(
    'paddleResizeAnimationX',
    'scaling.x',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const scaleXKeys = [
    { frame: 0, value: originalScaleX },
    { frame: 5, value: originalScaleX * overshootMultiplier },
    { frame: 15, value: originalScaleX * dampingMultiplier },
    { frame: 30, value: originalScaleX },
  ];
  scaleXAnim.setKeys(scaleXKeys);

  // Animate depth
  const scaleZAnim = new Animation(
    'paddleResizeAnimationZ',
    'scaling.z',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const scaleZKeys = [
    { frame: 0, value: originalScaleZ },
    { frame: 5, value: originalScaleZ * overshootMultiplier },
    { frame: 15, value: originalScaleZ * dampingMultiplier },
    { frame: 30, value: originalScaleZ },
  ];
  scaleZAnim.setKeys(scaleZKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  scaleYAnim.setEasingFunction(easingFunction);
  scaleXAnim.setEasingFunction(easingFunction);
  scaleZAnim.setEasingFunction(easingFunction);

  paddleMesh.animations = [scaleYAnim, scaleXAnim, scaleZAnim];

  scene.beginAnimation(paddleMesh, 0, 30, false, 1, () => {
    paddleMesh.scaling.y = scaledHeight;
    paddleMesh.scaling.x = originalScaleX;
    paddleMesh.scaling.z = originalScaleZ;
  });
}

function disposeParticleWithAnimation(particleSystem: ParticleSystem, paddleMesh: Mesh): void {
  if (!particleSystem || !particleSystem.emitter) return;

  particleSystem.emitRate = 0;

  const fadeOutDuration = 800;
  const startTime = Date.now();

  const scene = particleSystem.getScene();

  if (!scene) return;

  const originalUpdateFunction = particleSystem.updateFunction;

  particleSystem.updateFunction = (particles) => {
    // Call original update function if it exists
    if (originalUpdateFunction) originalUpdateFunction(particles);

    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / fadeOutDuration, 1);

    // Cubic ease-in for smooth acceleration toward paddle
    const easedProgress = progress * progress * progress;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      const targetX = paddleMesh.position.x;
      const targetY = paddleMesh.position.y;
      const targetZ = paddleMesh.position.z;

      const directionX = targetX - particle.position.x;
      const directionY = targetY - particle.position.y;
      const directionZ = targetZ - particle.position.z;

      const distance = Math.sqrt(
        directionX * directionX + directionY * directionY + directionZ * directionZ
      );

      const speedFactor = 0.01 + easedProgress * 0.1 + distance * 0.01;

      // Move particles toward paddle with increasing speed
      particle.position.x += directionX * speedFactor;
      particle.position.y += directionY * speedFactor;
      particle.position.z += directionZ * speedFactor;

      // Create a spiral effect by adding circular motion
      const spiralAngle = progress * 10 + i * 0.1;
      const spiralRadius = (1 - easedProgress) * 0.2;
      particle.position.x += Math.cos(spiralAngle) * spiralRadius * (1 - progress);
      particle.position.y += Math.sin(spiralAngle) * spiralRadius * (1 - progress);

      const distanceScaleFactor = Math.min(1, distance / 2);
      const timeScaleFactor = 1 - 0.3 * easedProgress;
      particle.size = particle.size * distanceScaleFactor * timeScaleFactor;

      if (distance < 0.3) {
        particle.color.a *= 1 - (0.3 - distance) / 0.3;
      } else {
        particle.color.a = Math.max(0.1, 1 - easedProgress * 1.2);
      }
    }

    if (progress >= 1) particleSystem.dispose();
  };

  const disposeObserver = scene.onDisposeObservable.add(() => {
    if (particleSystem) particleSystem.dispose();
  });

  setTimeout(() => {
    if (particleSystem) {
      scene.onDisposeObservable.remove(disposeObserver);
      particleSystem.dispose();
    }
  }, fadeOutDuration + 100);
}

function clearAllPlayerEffects(
  scene: Scene,
  paddleMesh: Mesh,
  playerEffects: PlayerEffects,
  primaryColor: Color3
): void {
  playerEffects.activeEffects.forEach((effect) => {
    if (effect.particleSystem) disposeParticleWithAnimation(effect.particleSystem, paddleMesh);
    if (effect.glowLayer) effect.glowLayer.dispose();
  });

  playerEffects.activeEffects.clear();

  if (paddleMesh.material) {
    const baseEmissive = defaultGameObjectParams.paddle.emissiveIntensity;
    animateMaterialTransition(paddleMesh, primaryColor, baseEmissive);
  }

  const originalHeight = paddleMesh.getBoundingInfo().boundingBox.extendSize.y * 2;
  const scaledHeight = gameToSceneSize(playerEffects.paddleHeight) / originalHeight;

  paddleMesh.scaling.y = scaledHeight;

  scene.stopAnimation(paddleMesh);
}
