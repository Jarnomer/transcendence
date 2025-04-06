import { Animation, Color3, CubicEase, EasingFunction, Mesh, Scene } from 'babylonjs';

import { PowerUp, Player } from '@shared/types';

import { enforceBoundary, gameToSceneY, gameToSceneSize } from './gameUtilities';

interface LastAppliedPowerUp {
  type: string | null;
  timestamp: number;
  height: number;
  position: number;
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
  color: Color3
): void {
  const player1PowerUps = getActivePowerUps(powerUps, 1);
  const player2PowerUps = getActivePowerUps(powerUps, 2);

  applyPaddleEffects(scene, player1Mesh, players.player1, player1PowerUps, color, 1);
  applyPaddleEffects(scene, player2Mesh, players.player2, player2PowerUps, color, 2);

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
  color: Color3,
  playerIndex: number
): void {
  const lastState = lastAppliedPowerUps.get(playerIndex) || {
    type: null,
    timestamp: 0,
    height: player.paddleHeight,
    position: player.y,
  };

  // Get most recently applied power-up and apply new effects if needed
  if (activePowerUps.length > 0) {
    const latestPowerUp = activePowerUps.sort((a, b) => b.timeToExpire - a.timeToExpire)[0];
    const isNewPowerUp = lastState.type !== latestPowerUp.type;
    const hasHeightChanged = Math.abs(lastState.height - player.paddleHeight) > 0.1;

    if (isNewPowerUp || hasHeightChanged) {
      lastAppliedPowerUps.set(playerIndex, {
        type: latestPowerUp.type,
        timestamp: Date.now(),
        height: player.paddleHeight,
        position: player.y,
      });

      // Check if position needs adjustment due to boundary constraints
      const adjustedY = enforceBoundary(player.y, player.paddleHeight);
      if (Math.abs(adjustedY - player.y) > 0.1) {
        paddleMesh.position.y = gameToSceneY(adjustedY, paddleMesh);
      }

      animatePaddleResize(scene, paddleMesh, player.paddleHeight, color, latestPowerUp.type);
    }
  }
  // No active power-ups but we had one before
  else if (lastState.type !== null) {
    lastAppliedPowerUps.set(playerIndex, {
      type: null,
      timestamp: Date.now(),
      height: player.paddleHeight,
      position: player.y,
    });

    // Check if position needs adjustment when returning to normal size
    const adjustedY = enforceBoundary(player.y, player.paddleHeight);
    if (Math.abs(adjustedY - player.y) > 0.1) {
      paddleMesh.position.y = gameToSceneY(adjustedY, paddleMesh);
    }

    animatePaddleResize(scene, paddleMesh, player.paddleHeight, color, 'reset');
  }
}

function animatePaddleResize(
  scene: Scene,
  paddleMesh: Mesh,
  targetHeight: number,
  color: Color3,
  powerUpType: string
): void {
  const targetHeightInBabylonUnits = gameToSceneSize(targetHeight);
  const originalHeight = paddleMesh.getBoundingInfo().boundingBox.extendSize.y * 2;
  const targetScaleY = targetHeightInBabylonUnits / originalHeight;
  const isGrowing = paddleMesh.scaling.y < targetScaleY;

  if (Math.abs(paddleMesh.scaling.y - targetScaleY) < 0.05) return;

  let overshootMultiplier: number;
  let dampingMultiplier: number;

  if (isGrowing) {
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
    (p) => p.collected && p.affectedPlayer === playerIndex && p.timeToExpire > 0
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
