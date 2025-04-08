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

import { PowerUp, Player } from '@shared/types';

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
      // Clean up any existing effects
      if (lastState.particleSystem) {
        lastState.particleSystem.dispose();
      }
      if (lastState.glowLayer) {
        lastState.glowLayer.dispose();
      }

      // Create new effects
      const { particleSystem, glowLayer } = createPowerUpVisualEffects(
        scene,
        paddleMesh,
        latestPowerUp.type,
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

      applyPaddleMaterial(paddleMesh, latestPowerUp.type, primaryColor, secondaryColor, true);
      animatePaddleResize(scene, paddleMesh, player.paddleHeight);
    }
  }
  // No active power-ups but we had one before
  else if (lastState.type !== null) {
    // Clean up effects
    if (lastState.particleSystem) {
      fadeOutAndDisposeParticleSystem(lastState.particleSystem);
    }
    if (lastState.glowLayer) {
      lastState.glowLayer.dispose();
    }

    // Reset the paddle material
    applyPaddleMaterial(paddleMesh, null, primaryColor, secondaryColor, false);

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
  primaryColor: Color3,
  secondaryColor: Color3,
  playerIndex: number
): { particleSystem: ParticleSystem; glowLayer: GlowLayer } {
  // Determine if the power-up is negative
  const isNegative = isNegativePowerUp(powerUpType);

  // Use secondary color for negative power-ups, primary for positive
  const effectColor = isNegative ? secondaryColor : primaryColor;

  // Create glow layer
  const glowLayer = new GlowLayer(`powerUpGlow-${playerIndex}`, scene);
  glowLayer.intensity = 0.6;
  glowLayer.blurKernelSize = 64;
  glowLayer.addIncludedOnlyMesh(paddleMesh);

  // Create particle system
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
  // Determine which particle texture to use based on power-up type
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

  // Create the particle system
  const particleSystem = new ParticleSystem(`powerUpParticles-${playerIndex}`, 50, scene);

  // Set the particle texture
  particleSystem.particleTexture = new Texture(particleTexturePath, scene);

  // Set emitter to be at the paddle position
  const paddlePosition = paddleMesh.position.clone();

  // Adjust emitter position based on player side (left or right)
  const isPlayer1 = playerIndex === 1;
  const xOffset = isPlayer1 ? 0.2 : -0.2; // Offset from paddle

  particleSystem.emitter = new Vector3(
    paddlePosition.x + xOffset,
    paddlePosition.y,
    paddlePosition.z
  );

  // Set particle release direction (approximately 150 degrees, adjusted for player side)
  const emitAngle = isPlayer1 ? Math.PI * (150 / 180) : Math.PI * (30 / 180);
  const dirX = Math.cos(emitAngle);
  const dirY = Math.sin(emitAngle);

  particleSystem.direction1 = new Vector3(dirX - 0.2, dirY + 0.1, 0);
  particleSystem.direction2 = new Vector3(dirX + 0.2, dirY + 0.3, 0);

  // Configure particle properties
  particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
  particleSystem.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 1.0);
  particleSystem.colorDead = new Color4(color.r * 0.3, color.g * 0.3, color.b * 0.3, 0);

  particleSystem.minSize = 0.05;
  particleSystem.maxSize = 0.15;
  particleSystem.minLifeTime = 0.5;
  particleSystem.maxLifeTime = 1.5;
  particleSystem.emitRate = 8;
  particleSystem.minEmitPower = 0.2;
  particleSystem.maxEmitPower = 0.5;

  // Add gravity effect to make particles float slightly upward
  particleSystem.gravity = new Vector3(0, -0.05, 0);

  // Add slight rotation to particles
  particleSystem.minAngularSpeed = -0.5;
  particleSystem.maxAngularSpeed = 0.5;

  // Make particles follow the paddle
  scene.onBeforeRenderObservable.add(() => {
    (particleSystem.emitter as Vector3).y = paddleMesh.position.y;
  });

  // Start the particle system
  particleSystem.start();

  return particleSystem;
}

function fadeOutAndDisposeParticleSystem(particleSystem: ParticleSystem): void {
  // Stop emitting new particles
  particleSystem.emitRate = 0;

  // Gradually fade out existing particles
  const fadeOutDuration = 1000; // ms
  const startTime = Date.now();

  const fadeInterval = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const progress = Math.min(elapsedTime / fadeOutDuration, 1);

    if (progress >= 1) {
      // Dispose the particle system after fade-out
      clearInterval(fadeInterval);
      particleSystem.dispose();
    } else {
      // Reduce particle size and opacity gradually
      particleSystem.minSize *= 1 - progress * 0.1;
      particleSystem.maxSize *= 1 - progress * 0.1;
    }
  }, 100);
}

function applyPaddleMaterial(
  paddleMesh: Mesh,
  powerUpType: string | null,
  primaryColor: Color3,
  secondaryColor: Color3,
  isPowerUpActive: boolean
): void {
  if (!paddleMesh.material) return;

  const material = paddleMesh.material as PBRMaterial;

  if (isPowerUpActive && powerUpType) {
    // Determine if this is a negative power-up
    const isNegative = isNegativePowerUp(powerUpType);

    // Set paddle to bright/glowing based on power-up type
    if (isNegative) {
      // Negative power-up (use secondary color)
      material.emissiveColor = secondaryColor;
    } else {
      // Positive power-up (use primary color)
      material.emissiveColor = primaryColor;
    }

    // Enhance emissive properties for power-up effect
    material.emissiveIntensity = 2.0; // Higher intensity for power-up state

    // Animate transition to glowing state
    animateMaterialTransition(paddleMesh, material.emissiveColor, 2.0);
  } else {
    // Return to normal state (use primary color)
    material.emissiveColor = primaryColor;
    material.emissiveIntensity = 1.0; // Default from defaultGameObjectParams

    // Animate transition back to normal
    animateMaterialTransition(paddleMesh, primaryColor, 1.0);
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

function isNegativePowerUp(type: string): boolean {
  return type === 'smaller_paddle' || type === 'slower_paddle';
}

function getActivePowerUps(powerUps: PowerUp[], playerIndex: number): PowerUp[] {
  return powerUps.filter(
    (p) => p.collectedBy > 0 && p.affectedPlayer === playerIndex && p.timeToExpire > 0
  );
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
