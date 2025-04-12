import {
  Animation,
  Color3,
  Color4,
  CubicEase,
  EasingFunction,
  GlowLayer,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PBRMaterial,
  Scene,
  Texture,
  Vector3,
} from 'babylonjs';

import { playerPowerUp, Player, PowerUpType, defaultGameObjectParams } from '@shared/types';

import { gameToSceneSize } from './gameUtilities';

const playerEffectsMap: Map<number, PlayerEffects> = new Map();

interface PowerUpEffect {
  type: PowerUpType;
  timestamp: number;
  particleSystem: ParticleSystem | null;
  glowLayer: GlowLayer | null;
  icons: Mesh[];
}

interface PlayerEffects {
  paddleHeight: number;
  position: number;
  activeEffects: Map<string, PowerUpEffect>;
}

interface LogConfig {
  enabled: boolean;
  logFrequency: number;
}

const loggingConfig: LogConfig = {
  enabled: true,
  logFrequency: 3000, // ms
};

let lastLogTime = 0;

export function applyPlayerEffects(
  scene: Scene,
  player1Mesh: Mesh,
  player2Mesh: Mesh,
  players: { player1: Player; player2: Player },
  primaryColor: Color3,
  secondaryColor: Color3
): void {
  applyPaddleEffects(scene, player1Mesh, players.player1, primaryColor, secondaryColor, 1);
  applyPaddleEffects(scene, player2Mesh, players.player2, primaryColor, secondaryColor, 2);

  // Logging player power ups and statistics every X second(s)
  const currentTime = Date.now();
  if (loggingConfig.enabled && currentTime - lastLogTime > loggingConfig.logFrequency) {
    logPlayerState(players.player1);
    logPlayerState(players.player2);
    lastLogTime = currentTime;
  }
}

function applyPaddleEffects(
  scene: Scene,
  paddleMesh: Mesh,
  player: Player,
  primaryColor: Color3,
  secondaryColor: Color3,
  playerIndex: number
): void {
  if (!playerEffectsMap.has(playerIndex)) {
    playerEffectsMap.set(playerIndex, {
      paddleHeight: player.paddleHeight,
      position: player.y,
      activeEffects: new Map(),
    });
  } else {
    const playerEffects = playerEffectsMap.get(playerIndex)!;

    if (playerEffects.paddleHeight !== player.paddleHeight) {
      playerEffects.paddleHeight = player.paddleHeight;
      animatePaddleResize(scene, paddleMesh, player.paddleHeight);
    }
    playerEffects.position = player.y;
  }

  const playerEffects = playerEffectsMap.get(playerIndex)!;
  const currentEffectTypes = new Set(player.activePowerUps.map((p) => p.type));

  const hadEffects = playerEffects.activeEffects.size > 0;
  const hasNoEffectsNow = player.activePowerUps.length === 0;

  if (hadEffects && hasNoEffectsNow) {
    clearAllPlayerEffects(scene, paddleMesh, playerEffects, primaryColor);
    return;
  }

  // Check for new power up effects
  for (const powerUp of player.activePowerUps) {
    const effectKey = powerUp.type;

    if (!playerEffects.activeEffects.has(effectKey)) {
      const { particleSystem, glowLayer, icons } = createPowerUpVisualEffects(
        scene,
        paddleMesh,
        powerUp.type,
        powerUp.isNegative,
        primaryColor,
        secondaryColor,
        playerIndex,
        // Use size to increment effects
        playerEffects.activeEffects.size
      );

      playerEffects.activeEffects.set(effectKey, {
        type: powerUp.type,
        timestamp: Date.now(),
        particleSystem,
        glowLayer,
        icons,
      });

      applyPaddleMaterial(paddleMesh, player.activePowerUps, primaryColor, secondaryColor);
    }
  }

  // Check and dispose expired effects
  const expiredEffects: string[] = [];
  playerEffects.activeEffects.forEach((_, type) => {
    if (!currentEffectTypes.has(type)) {
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
  isNegative: boolean,
  primaryColor: Color3,
  secondaryColor: Color3,
  playerIndex: number,
  effectIndex: number
): { particleSystem: ParticleSystem; glowLayer: GlowLayer; icons: Mesh[] } {
  const glowLayer = new GlowLayer(`powerUpGlow-${playerIndex}-${powerUpType}`, scene);
  const effectColor = isNegative ? secondaryColor : primaryColor;

  glowLayer.intensity = Math.max(0.2, 0.4 - effectIndex * 0.05);
  glowLayer.blurKernelSize = 48;
  glowLayer.addIncludedOnlyMesh(paddleMesh);

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
  const xOffset = playerIndex === 1 ? 2.5 : -2.5;

  const iconUp = createPowerUpIconMesh(scene, powerUpType, effectColor, `up-${playerIndex}`);

  const iconDown = createPowerUpIconMesh(scene, powerUpType, effectColor, `down-${playerIndex}`);

  const icons = [iconUp, iconDown];

  positionIconsInFrontOfPaddle(paddleMesh, icons, xOffset);

  animatePowerUpIcons(scene, icons, paddleMesh);

  return icons;
}

function createPowerUpIconMesh(
  scene: Scene,
  powerUpType: PowerUpType,
  effectColor: Color3,
  suffix: string
): Mesh {
  const iconPath = getPowerUpIconPath(powerUpType);
  const iconSize = 3;

  const mesh = MeshBuilder.CreatePlane(
    `powerUpIcon-${powerUpType}-${suffix}`,
    { width: iconSize, height: iconSize },
    scene
  );

  const material = new PBRMaterial(`powerUpIconMaterial-${powerUpType}-${suffix}`, scene);
  const texture = new Texture(iconPath, scene);

  material.emissiveColor = effectColor;
  material.emissiveTexture = texture;
  material.opacityTexture = texture;
  material.backFaceCulling = false;
  material.disableLighting = true;
  material.albedoColor = Color3.Black();

  mesh.material = material;
  mesh.isPickable = false;

  return mesh;
}

function positionIconsInFrontOfPaddle(paddleMesh: Mesh, icons: Mesh[], xOffset: number): void {
  const paddlePosition = paddleMesh.position.clone();

  icons.forEach((icon, index) => {
    icon.position = new Vector3(
      paddlePosition.x + xOffset,
      paddlePosition.y,
      paddlePosition.z + (index === 0 ? 0.5 : -0.5)
    );

    icon.scaling = new Vector3(0, 0, 0);
  });
}

function animatePowerUpIcons(scene: Scene, icons: Mesh[], paddleMesh: Mesh): void {
  if (icons.length !== 2) return;

  const [iconUp, iconDown] = icons;
  const paddlePosition = paddleMesh.position.clone();
  const baseColor = (iconUp.material as PBRMaterial).emissiveColor.clone();

  // Position animation for up icon
  const posUpAnim = new Animation(
    'iconUpPositionAnimation',
    'position',
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const upPosKeys = [
    { frame: 0, value: new Vector3(iconUp.position.x, paddlePosition.y, iconUp.position.z) },
    { frame: 60, value: new Vector3(iconUp.position.x, paddlePosition.y + 2, iconUp.position.z) },
  ];

  posUpAnim.setKeys(upPosKeys);

  // Animate position
  const posDownAnim = new Animation(
    'iconDownPositionAnimation',
    'position',
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const downPosKeys = [
    { frame: 0, value: new Vector3(iconDown.position.x, paddlePosition.y, iconDown.position.z) },
    {
      frame: 60,
      value: new Vector3(iconDown.position.x, paddlePosition.y - 2, iconDown.position.z),
    },
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
    { frame: 15, value: new Vector3(1.5, 1.5, 1.5) },
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
    { frame: 15, value: 1 },
    { frame: 45, value: 1 },
    { frame: 60, value: 0 },
  ];
  opacityAnim.setKeys(opacityKeys);

  // Animate color flash
  const colorAnim = new Animation(
    'iconColorAnimation',
    'material.emissiveColor',
    30,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const colorKeys = [
    { frame: 0, value: baseColor },
    { frame: 10, value: Color3.White() },
    { frame: 20, value: baseColor },
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

function createPowerUpParticles(
  scene: Scene,
  paddleMesh: Mesh,
  powerUpType: PowerUpType,
  color: Color3,
  playerIndex: number,
  effectIndex: number
): ParticleSystem {
  const particleTexturePath = getPowerUpSignPath(powerUpType);
  const paddlePosition = paddleMesh.position.clone();
  const particleSystem = new ParticleSystem(
    `powerUpParticles-${playerIndex}-${powerUpType}`,
    40,
    scene
  );

  particleSystem.emitter = paddlePosition.clone();

  particleSystem.particleTexture = new Texture(particleTexturePath, scene);

  particleSystem.emitRate = Math.max(6, 12 - effectIndex * 2);
  particleSystem.minSize = 0.5 - effectIndex * 0.05;
  particleSystem.maxSize = 1.5 - effectIndex * 0.1;

  particleSystem.minLifeTime = 3;
  particleSystem.maxLifeTime = 5;
  particleSystem.minEmitPower = 4;
  particleSystem.maxEmitPower = 8;

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

  particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
  particleSystem.color2 = new Color4(color.r * 1.5, color.g * 1.5, color.b * 1.5, 1.0);
  particleSystem.colorDead = new Color4(color.r * 0.3, color.g * 0.3, color.b * 0.3, 0);

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  particleSystem.minAngularSpeed = -0.3;
  particleSystem.maxAngularSpeed = 0.3;

  scene.onBeforeRenderObservable.add(() => {
    (particleSystem.emitter as Vector3).y = paddleMesh.position.y;
  });

  particleSystem.start();

  return particleSystem;
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

  const isGrowing = paddleMesh.scaling.y < scaledHeight;

  const originalScaleX = paddleMesh.scaling.x;
  const originalScaleZ = paddleMesh.scaling.z;

  let overshootMultiplier: number;
  let dampingMultiplier: number;
  let xzMultiplier: number;

  if (isGrowing) {
    overshootMultiplier = 1.3;
    dampingMultiplier = 1.1;
    xzMultiplier = 1.3;
  } else {
    overshootMultiplier = 0.7;
    dampingMultiplier = 0.9;
    xzMultiplier = 0.7;
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
    { frame: 5, value: originalScaleX * xzMultiplier },
    { frame: 15, value: originalScaleX * (xzMultiplier * 0.8 + 0.2) },
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
    { frame: 5, value: originalScaleZ * xzMultiplier },
    { frame: 15, value: originalScaleZ * (xzMultiplier * 0.8 + 0.2) },
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

function getPowerUpIconPath(powerUpType: PowerUpType) {
  switch (powerUpType) {
    case PowerUpType.BiggerPaddle:
      return '/power-up/paddle_bigger.png';
    case PowerUpType.SmallerPaddle:
      return '/power-up/paddle_smaller.png';
    case PowerUpType.FasterPaddle:
      return '/power-up/paddle_faster.png';
    case PowerUpType.SlowerPaddle:
      return '/power-up/paddle_slower.png';
    case PowerUpType.MoreSpin:
      return '/power-up/paddle_spin.png';
    default:
      return '/power-up/unknown_powerup.png';
  }
}

function getPowerUpSignPath(powerUpType: PowerUpType) {
  switch (powerUpType) {
    case PowerUpType.BiggerPaddle:
      return '/power-up/sign_plus.png';
    case PowerUpType.SmallerPaddle:
      return '/power-up/sign_minus.png';
    case PowerUpType.FasterPaddle:
      return '/power-up/sign_fast.png';
    case PowerUpType.SlowerPaddle:
      return '/power-up/sign_slow.png';
    case PowerUpType.MoreSpin:
      return '/power-up/sign_spin.png';
    default:
      return '/power-up/sign_unknown.png';
  }
}

function logPlayerState(player: Player): void {
  const powerUpsInfo =
    player.activePowerUps.length > 0
      ? player.activePowerUps
          .map((p) => `      - ${p.type} (expires in: ${p.timeToExpire}ms)`)
          .join('\n')
      : '      - None';

  console.log(`    Player: ${player.id}
    Power-Ups:
${powerUpsInfo}`);
}
