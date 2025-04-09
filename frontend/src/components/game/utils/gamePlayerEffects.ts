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

import { PowerUp, Player, defaultGameObjectParams } from '@shared/types';

import { enforceBoundary, gameToSceneY, gameToSceneSize } from './gameUtilities';

interface LastAppliedPowerUp {
  type: string | null;
  timestamp: number;
  height: number;
  position: number;
  particleSystem: ParticleSystem | null;
  glowLayer: GlowLayer | null;
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

const lastAppliedPowerUps: Map<number, LastAppliedPowerUp> = new Map();

export function applyPlayerEffects(
  scene: Scene,
  player1Mesh: Mesh,
  player2Mesh: Mesh,
  players: { player1: Player; player2: Player },
  powerUps: PowerUp[],
  primaryColor: Color3,
  secondaryColor: Color3
): void {
  const player1PowerUps = getActivePowerUps(powerUps, 1);
  const player2PowerUps = getActivePowerUps(powerUps, 2);

  applyPaddleEffects(
    scene,
    player1Mesh,
    players.player1,
    player1PowerUps,
    primaryColor,
    secondaryColor,
    1
  );
  applyPaddleEffects(
    scene,
    player2Mesh,
    players.player2,
    player2PowerUps,
    primaryColor,
    secondaryColor,
    2
  );

  // Logging player power ups and statistics every X second(s)
  const currentTime = Date.now();
  if (loggingConfig.enabled && currentTime - lastLogTime > loggingConfig.logFrequency) {
    logPlayerState({
      player: players.player1,
      mesh: player1Mesh,
      powerUps: player1PowerUps,
    });
    lastLogTime = currentTime;
  }
}

function applyPaddleEffects(
  scene: Scene,
  paddleMesh: Mesh,
  player: Player,
  activePowerUps: PowerUp[],
  primaryColor: Color3,
  secondaryColor: Color3,
  playerIndex: number
): void {
  const lastState = lastAppliedPowerUps.get(playerIndex) || {
    type: null,
    timestamp: 0,
    height: player.paddleHeight,
    position: player.y,
    particleSystem: null,
    glowLayer: null,
  };

  // Get most recently applied power-up and apply new effects if needed
  if (activePowerUps.length > 0) {
    const latestPowerUp = activePowerUps.sort((a, b) => b.timeToExpire - a.timeToExpire)[0];
    const isNewPowerUp = lastState.type !== latestPowerUp.type;
    const hasHeightChanged = Math.abs(lastState.height - player.paddleHeight) > 0.1;

    if (isNewPowerUp || hasHeightChanged) {
      if (lastState.particleSystem) lastState.particleSystem.dispose();
      if (lastState.glowLayer) lastState.glowLayer.dispose();

      // Create new effects
      const { particleSystem, glowLayer } = createPowerUpVisualEffects(
        scene,
        paddleMesh,
        latestPowerUp.type,
        latestPowerUp.negativeEffect,
        primaryColor,
        secondaryColor,
        playerIndex
      );

      lastAppliedPowerUps.set(playerIndex, {
        type: latestPowerUp.type,
        timestamp: Date.now(),
        height: player.paddleHeight,
        position: player.y,
        particleSystem,
        glowLayer,
      });

      // Check if position needs adjustment due to boundary constraints
      const adjustedY = enforceBoundary(player.y, player.paddleHeight);
      if (Math.abs(adjustedY - player.y) > 0.1) {
        paddleMesh.position.y = gameToSceneY(adjustedY, paddleMesh);
      }

      applyPaddleMaterial(
        paddleMesh,
        latestPowerUp.type,
        latestPowerUp.negativeEffect,
        primaryColor,
        secondaryColor,
        true
      );
      animatePaddleResize(scene, paddleMesh, player.paddleHeight);
    }
  }
  // No active power-ups but we had one before
  else if (lastState.type !== null) {
    if (lastState.particleSystem) disposeParticleWithAnimation(lastState.particleSystem);
    if (lastState.glowLayer) lastState.glowLayer.dispose();

    // Reset the paddle material
    applyPaddleMaterial(paddleMesh, null, false, primaryColor, secondaryColor, false);

    lastAppliedPowerUps.set(playerIndex, {
      type: null,
      timestamp: Date.now(),
      height: player.paddleHeight,
      position: player.y,
      particleSystem: null,
      glowLayer: null,
    });

    // Check if position needs adjustment when returning to normal size
    const adjustedY = enforceBoundary(player.y, player.paddleHeight);
    if (Math.abs(adjustedY - player.y) > 0.1) {
      paddleMesh.position.y = gameToSceneY(adjustedY, paddleMesh);
    }

    animatePaddleResize(scene, paddleMesh, player.paddleHeight);
  }
}

function createPowerUpVisualEffects(
  scene: Scene,
  paddleMesh: Mesh,
  powerUpType: string,
  isNegative: boolean,
  primaryColor: Color3,
  secondaryColor: Color3,
  playerIndex: number
): { particleSystem: ParticleSystem; glowLayer: GlowLayer } {
  const effectColor = isNegative ? secondaryColor : primaryColor;

  const glowLayer = new GlowLayer(`powerUpGlow-${playerIndex}`, scene);
  glowLayer.intensity = 0.4;
  glowLayer.blurKernelSize = 48;
  glowLayer.addIncludedOnlyMesh(paddleMesh);

  const particleSystem = createPowerUpParticles(
    scene,
    paddleMesh,
    powerUpType,
    effectColor,
    playerIndex
  );

  return { particleSystem, glowLayer };
}

function createPowerUpParticles(
  scene: Scene,
  paddleMesh: Mesh,
  powerUpType: string,
  color: Color3,
  playerIndex: number
): ParticleSystem {
  let particleTexturePath = '';

  switch (powerUpType) {
    case 'bigger_paddle':
      particleTexturePath = '/power-up/sign_plus.png';
      break;
    case 'smaller_paddle':
      particleTexturePath = '/power-up/sign_minus.png';
      break;
    case 'faster_paddle':
      particleTexturePath = '/power-up/sign_fast.png';
      break;
    case 'slower_paddle':
      particleTexturePath = '/power-up/sign_slow.png';
      break;
    case 'more_spin':
      particleTexturePath = '/power-up/sign_spin.png';
      break;
    default:
      particleTexturePath = '/power-up/sign_unknown.png';
  }

  const particleSystem = new ParticleSystem(`powerUpParticles-${playerIndex}`, 40, scene);
  const paddlePosition = paddleMesh.position.clone();

  particleSystem.emitter = new Vector3(paddlePosition.x, paddlePosition.y, paddlePosition.z);
  particleSystem.particleTexture = new Texture(particleTexturePath, scene);

  particleSystem.minSize = 0.5;
  particleSystem.maxSize = 1.5;
  particleSystem.minLifeTime = 3;
  particleSystem.maxLifeTime = 5;
  particleSystem.minEmitPower = 4;
  particleSystem.maxEmitPower = 8;
  particleSystem.emitRate = 12;

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
  powerUpType: string | null,
  isNegative: boolean,
  primaryColor: Color3,
  secondaryColor: Color3,
  isPowerUpActive: boolean
): void {
  if (!paddleMesh.material) return;

  const material = paddleMesh.material as PBRMaterial;
  const baseEmissive = defaultGameObjectParams.paddle.emissiveIntensity;

  if (isPowerUpActive && powerUpType) {
    if (isNegative) {
      material.emissiveColor = secondaryColor;
    } else {
      material.emissiveColor = primaryColor;
    }

    material.emissiveIntensity = baseEmissive * 1.5;

    animateMaterialTransition(paddleMesh, material.emissiveColor, baseEmissive * 1.5);
  } else {
    material.emissiveColor = primaryColor;
    material.emissiveIntensity = baseEmissive;

    animateMaterialTransition(paddleMesh, primaryColor, baseEmissive);
  }
}

function animateMaterialTransition(mesh: Mesh, targetColor: Color3, targetIntensity: number): void {
  if (!mesh.material) return;

  const material = mesh.material as PBRMaterial;
  const startColor = material.emissiveColor.clone();
  const startIntensity = material.emissiveIntensity;

  // Animate color
  const colorAnim = new Animation(
    'materialColorAnimation',
    'material.emissiveColor',
    30,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const colorKeys = [
    { frame: 0, value: startColor },
    { frame: 20, value: targetColor },
  ];
  colorAnim.setKeys(colorKeys);

  // Animate intensity
  const intensityAnim = new Animation(
    'materialIntensityAnimation',
    'material.emissiveIntensity',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const intensityKeys = [
    { frame: 0, value: startIntensity },
    { frame: 20, value: targetIntensity },
  ];
  intensityAnim.setKeys(intensityKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  colorAnim.setEasingFunction(easingFunction);
  intensityAnim.setEasingFunction(easingFunction);

  mesh.animations = [colorAnim, intensityAnim];

  mesh.getScene().beginAnimation(mesh, 0, 20, false);
}

function animatePaddleResize(scene: Scene, paddleMesh: Mesh, targetHeight: number): void {
  const targetHeightInBabylonUnits = gameToSceneSize(targetHeight);
  const originalHeight = paddleMesh.getBoundingInfo().boundingBox.extendSize.y * 2;
  const targetScaleY = targetHeightInBabylonUnits / originalHeight;

  if (Math.abs(paddleMesh.scaling.y - targetScaleY) < 0.05) return;

  let overshootMultiplier: number;
  let dampingMultiplier: number;

  if (paddleMesh.scaling.y < targetScaleY) {
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
    { frame: 5, value: targetScaleY * overshootMultiplier },
    { frame: 15, value: targetScaleY * dampingMultiplier },
    { frame: 30, value: targetScaleY },
  ];
  scaleAnim.setKeys(scaleKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  scaleAnim.setEasingFunction(easingFunction);

  paddleMesh.animations = [scaleAnim];

  scene.beginAnimation(paddleMesh, 0, 30, false, 1);
}

function getActivePowerUps(powerUps: PowerUp[], playerIndex: number): PowerUp[] {
  return powerUps.filter(
    (p) => p.collectedBy > 0 && p.affectedPlayer === playerIndex && p.timeToExpire > 0
  );
}

function disposeParticleWithAnimation(particleSystem: ParticleSystem): void {
  particleSystem.emitRate = 0;

  const fadeOutDuration = 1000;
  const startTime = Date.now();

  const fadeInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / fadeOutDuration, 1);

    if (progress >= 1) {
      clearInterval(fadeInterval);
      particleSystem.dispose();
    } else {
      particleSystem.minSize *= 1 - progress;
      particleSystem.maxSize *= 1 - progress;
    }
  }, 100);
}

function logPlayerState(player1Data: { player: Player; mesh: Mesh; powerUps: PowerUp[] }): void {
  const player1Log = formatPlayerLog(player1Data.player, player1Data.mesh, player1Data.powerUps);

  console.log(`${player1Log}`);

  function formatPlayerLog(player: Player, mesh: Mesh, powerUps: PowerUp[]): string {
    const sceneY = gameToSceneY(player.y, mesh);
    const scenePaddleHeight = gameToSceneSize(player.paddleHeight);

    const powerUpsInfo =
      powerUps.length > 0
        ? powerUps.map((p) => `      - ${p.type} (expires in: ${p.timeToExpire}ms)`).join('\n')
        : '      - None';

    return `    BACKEND
    Position Y: ${player.y}
    Paddle Height: ${player.paddleHeight}
    FRONTEND
    Mesh Y: ${sceneY}
    Mesh Height: ${scenePaddleHeight}
    Active Power-Ups:
${powerUpsInfo}`;
  }
}
