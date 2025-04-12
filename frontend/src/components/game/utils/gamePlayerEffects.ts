import {
  Animation,
  Color3,
  Color4,
  CubicEase,
  EasingFunction,
  GlowLayer,
  Mesh,
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
  powerUps: PowerUp[],
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

  const hadEffects = playerEffects.activeEffects.size > 0;
  const hasNoEffectsNow = player.activePowerUps.length === 0;

  if (hadEffects && hasNoEffectsNow) {
    clearAllPlayerEffects(scene, paddleMesh, playerEffects, primaryColor);
    return;
  }

  const currentEffectTypes = new Set(player.activePowerUps.map((p) => p.type));

  applyPaddleMaterial(paddleMesh, player.activePowerUps, primaryColor, secondaryColor);

  for (const powerUp of player.activePowerUps) {
    const effectKey = powerUp.type;

    if (!playerEffects.activeEffects.has(effectKey)) {
      const { particleSystem, glowLayer } = createPowerUpVisualEffects(
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
      });
    }
  }

  const effectsToRemove: string[] = [];
  playerEffects.activeEffects.forEach((_, type) => {
    if (!currentEffectTypes.has(type)) {
      effectsToRemove.push(type);
    }
  });

  for (const typeToRemove of effectsToRemove) {
    const effect = playerEffects.activeEffects.get(typeToRemove)!;
    if (effect.particleSystem) disposeParticleWithAnimation(effect.particleSystem, paddleMesh);
    if (effect.glowLayer) effect.glowLayer.dispose();
    playerEffects.activeEffects.delete(typeToRemove);
    animatePaddleResize(scene, paddleMesh, player.paddleHeight);
  }
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

function createPowerUpVisualEffects(
  scene: Scene,
  paddleMesh: Mesh,
  powerUpType: PowerUpType,
  isNegative: boolean,
  primaryColor: Color3,
  secondaryColor: Color3,
  playerIndex: number,
  effectIndex: number
): { particleSystem: ParticleSystem; glowLayer: GlowLayer } {
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

  return { particleSystem, glowLayer };
}

function createPowerUpParticles(
  scene: Scene,
  paddleMesh: Mesh,
  powerUpType: PowerUpType,
  color: Color3,
  playerIndex: number,
  effectIndex: number
): ParticleSystem {
  let particleTexturePath = '';

  switch (powerUpType) {
    case PowerUpType.BiggerPaddle:
      particleTexturePath = '/power-up/sign_plus.png';
      break;
    case PowerUpType.SmallerPaddle:
      particleTexturePath = '/power-up/sign_minus.png';
      break;
    case PowerUpType.FasterPaddle:
      particleTexturePath = '/power-up/sign_fast.png';
      break;
    case PowerUpType.SlowerPaddle:
      particleTexturePath = '/power-up/sign_slow.png';
      break;
    case PowerUpType.MoreSpin:
      particleTexturePath = '/power-up/sign_spin.png';
      break;
    default:
      particleTexturePath = '/power-up/sign_unknown.png';
  }

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
    { frame: 90, value: targetColor },
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
    { frame: 90, value: targetIntensity },
  ];
  intensityAnim.setKeys(intensityKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  colorAnim.setEasingFunction(easingFunction);
  intensityAnim.setEasingFunction(easingFunction);

  material.animations = [colorAnim, intensityAnim];

  scene.beginAnimation(material, 0, 90, false, 1, () => {
    material.emissiveColor = targetColor.clone();
    material.emissiveIntensity = targetIntensity;
  });
}

function animatePaddleResize(scene: Scene, paddleMesh: Mesh, targetHeight: number): void {
  const originalHeight = paddleMesh.getBoundingInfo().boundingBox.extendSize.y * 2;
  const scaledHeight = gameToSceneSize(targetHeight) / originalHeight;

  let overshootMultiplier: number;
  let dampingMultiplier: number;

  if (paddleMesh.scaling.y < scaledHeight) {
    overshootMultiplier = 1.3;
    dampingMultiplier = 1.1;
  } else {
    overshootMultiplier = 0.7;
    dampingMultiplier = 0.9;
  }

  const scaleAnim = new Animation(
    'paddleResizeAnimation',
    'scaling.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const scaleKeys = [
    { frame: 0, value: paddleMesh.scaling.y },
    { frame: 5, value: scaledHeight * overshootMultiplier },
    { frame: 15, value: scaledHeight * dampingMultiplier },
    { frame: 30, value: scaledHeight },
  ];
  scaleAnim.setKeys(scaleKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  scaleAnim.setEasingFunction(easingFunction);

  paddleMesh.animations = [scaleAnim];

  scene.beginAnimation(paddleMesh, 0, 30, false, 1, () => {
    paddleMesh.scaling.y = scaledHeight;
  });
}

function disposeParticleWithAnimation(particleSystem: ParticleSystem, paddleMesh: Mesh): void {
  if (!particleSystem || !particleSystem.emitter) return;

  // Stop emitting new particles
  particleSystem.emitRate = 0;

  const fadeOutDuration = 800; // Slightly longer for better visual effect
  const startTime = Date.now();

  // Find associated paddle mesh (emitter is usually positioned relative to the paddle)
  const emitter = particleSystem.emitter as Vector3;
  const scene = particleSystem.getScene();

  // Store original update function if it exists
  const originalUpdateFunction = particleSystem.updateFunction;

  // Create new update function for gathering effect
  particleSystem.updateFunction = (particles) => {
    // Call original update function if it exists
    if (originalUpdateFunction) {
      originalUpdateFunction(particles);
    }

    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / fadeOutDuration, 1);

    // Cubic ease-in for smooth acceleration toward paddle
    const easedProgress = progress * progress * progress;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];

      // Get current paddle position (it might be moving)
      const targetX = paddleMesh.position.x;
      const targetY = paddleMesh.position.y;
      const targetZ = paddleMesh.position.z;

      // Gradually move particles toward the paddle
      const directionX = targetX - particle.position.x;
      const directionY = targetY - particle.position.y;
      const directionZ = targetZ - particle.position.z;

      // Calculate distance to paddle
      const distance = Math.sqrt(
        directionX * directionX + directionY * directionY + directionZ * directionZ
      );

      // Speed increases as progress increases (particles accelerate toward paddle)
      // Also make particles move faster when they're farther away
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

      // Make particles smaller as they get closer to the paddle
      // Combine time-based and distance-based scaling
      const distanceScaleFactor = Math.min(1, distance / 2); // Scale down more when closer
      const timeScaleFactor = 1 - 0.3 * easedProgress;
      particle.size = particle.size * distanceScaleFactor * timeScaleFactor;

      // Decrease alpha based on progress and also when they get very close to paddle
      if (distance < 0.3) {
        // Fade out quickly when very close to paddle
        particle.color.a *= 1 - (0.3 - distance) / 0.3;
      } else {
        // Normal fade out based on time
        particle.color.a = Math.max(0.1, 1 - easedProgress * 1.2);
      }
    }

    // If animation complete, dispose of particle system
    if (progress >= 1) {
      if (particleSystem) {
        particleSystem.dispose();
      }
    }
  };

  // Ensure we clean up if the scene is disposed before animation completes
  const disposeObserver = scene.onDisposeObservable.add(() => {
    if (particleSystem) {
      particleSystem.dispose();
    }
  });

  // Set a backup timeout to ensure disposal happens even if render loop pauses
  setTimeout(() => {
    if (particleSystem) {
      scene.onDisposeObservable.remove(disposeObserver);
      particleSystem.dispose();
    }
  }, fadeOutDuration + 100);
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
