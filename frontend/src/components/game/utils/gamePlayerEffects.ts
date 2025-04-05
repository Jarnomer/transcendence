import { Animation, Color3, CubicEase, EasingFunction, Mesh, Scene } from 'babylonjs';

import { PowerUp, Player } from '@shared/types';

interface LastAppliedPowerUp {
  type: string | null;
  timestamp: number;
  height: number;
}

const lastAppliedPowerUps: Map<number, LastAppliedPowerUp> = new Map();

export function applyPlayerEffects(
  scene: Scene,
  player1Mesh: Mesh,
  player2Mesh: Mesh,
  players: { player1: Player; player2: Player },
  powerUps: PowerUp[],
  color: Color3
): void {
  // Find active power-ups for each player
  const player1PowerUps = powerUps.filter(
    (p) => p.collected && p.affectedPlayer === 1 && p.timeToExpire > 0
  );
  const player2PowerUps = powerUps.filter(
    (p) => p.collected && p.affectedPlayer === 2 && p.timeToExpire > 0
  );

  applyPaddleEffects(scene, player1Mesh, players.player1, player1PowerUps, color, 1);
  applyPaddleEffects(scene, player2Mesh, players.player2, player2PowerUps, color, 2);
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
  };

  if (activePowerUps.length > 0) {
    // Get most recently applied power-up and apply new effects if needed
    const latestPowerUp = activePowerUps.sort((a, b) => b.timeToExpire - a.timeToExpire)[0];
    const isNewPowerUp = lastState.type !== latestPowerUp.type;
    const hasHeightChanged = Math.abs(lastState.height - player.paddleHeight) > 0.1;

    if (isNewPowerUp || hasHeightChanged) {
      lastAppliedPowerUps.set(playerIndex, {
        type: latestPowerUp.type,
        timestamp: Date.now(),
        height: player.paddleHeight,
      });

      animatePaddleResize(scene, paddleMesh, player.paddleHeight, color, latestPowerUp.type);
    }
  }
  // No active power-ups but we had one before - reset to normal
  else if (lastState.type !== null) {
    lastAppliedPowerUps.set(playerIndex, {
      type: null,
      timestamp: Date.now(),
      height: player.paddleHeight,
    });

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
  const scaleFactor = 20;
  const targetHeightInBabylonUnits = targetHeight / scaleFactor;
  const originalHeight = paddleMesh.getBoundingInfo().boundingBox.extendSize.y * 2;
  const targetScaleY = targetHeightInBabylonUnits / originalHeight;

  if (Math.abs(paddleMesh.scaling.y - targetScaleY) < 0.05) return;

  const scaleAnim = new Animation(
    'paddleResizeAnimation',
    'scaling.y',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  scaleAnim.setEasingFunction(easingFunction);

  const keys = [
    { frame: 0, value: paddleMesh.scaling.y },
    { frame: 5, value: targetScaleY * 1.3 },
    { frame: 15, value: targetScaleY * 1.1 },
    { frame: 30, value: targetScaleY },
  ];
  scaleAnim.setKeys(keys);

  paddleMesh.animations = [scaleAnim];
  scene.beginAnimation(paddleMesh, 0, 20, false, 1);
}

export function getActivePowerUps(powerUps: PowerUp[], playerIndex: number): PowerUp[] {
  return powerUps.filter(
    (p) => p.collected && p.affectedPlayer === playerIndex && p.timeToExpire > 0
  );
}
