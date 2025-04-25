import { ArcRotateCamera, Color3, Mesh, Scene } from 'babylonjs';

import { RetroEffectsManager, GameSoundManager } from '@game/utils';

import { Ball, defaultGameParams, defaultRetroEffectTimings } from '@shared/types';

export function applyBackgroundCollisionEffects(
  retroEffectsRef: RetroEffectsManager | null | undefined,
  speed: number,
  spin: number,
  applyGlitch: boolean = true
): void {
  if (!retroEffectsRef || !applyGlitch) return;

  const speedFactor = Math.min(Math.max(speed / 5, 1.0), 3.0);
  const spinFactor = Math.min(Math.max(spin / 5, 0.5), 2.0);
  const combinedFactor = (speedFactor + spinFactor) / 4;

  retroEffectsRef.setGlitchAmount(combinedFactor * 0.3, 150);
}

function calculateBackgroundScoreEffectIntensity(
  playerScore: number,
  ballSpeed: number,
  ballSpin: number
): number {
  // Base intensity from player's current score (0.05 to 0.15)
  const maxScore = defaultGameParams.rules.maxScore;
  const scoreIntensity = Math.min(0.05 + (playerScore / maxScore) * 0.15, 0.15);

  // Add intensity based on how close the game is to ending (0.05 to 0.15)
  const remainingPoints = maxScore - playerScore;
  const endgameIntensity = Math.max(0.05, 0.15 * (1 - remainingPoints / maxScore));

  // Add intensity based on ball physics (0 to 0.2)
  const normalizedSpeed = Math.min(Math.max(ballSpeed / 15, 0), 1);
  const normalizedSpin = Math.min(Math.abs(ballSpin) / 10, 1);
  const physicsIntensity = normalizedSpeed * 0.1 + normalizedSpin * 0.1;

  // Return combined factor (ensure result is between 0.1 and 0.5)
  return Math.min(scoreIntensity + endgameIntensity + physicsIntensity, 0.5);
}

function calculateBackgroundEffectDelay(ballSpeed: number): number {
  const minDelay = 30;
  const maxDelay = 200;
  const normalizedSpeed = Math.min(Math.max(ballSpeed / 15, 0), 1);
  const delay = maxDelay - normalizedSpeed * (maxDelay - minDelay);

  return delay;
}

export function applyBackgroundScoreEffects(
  retroEffectsRef: RetroEffectsManager | null | undefined,
  playerScore: number,
  ballSpeed: number,
  ballSpin: number
): void {
  if (!retroEffectsRef) return;

  const intensityFactor = calculateBackgroundScoreEffectIntensity(playerScore, ballSpeed, ballSpin);
  const effectDelay = calculateBackgroundEffectDelay(ballSpeed);

  setTimeout(() => {
    retroEffectsRef.simulateTrackingDistortion(
      intensityFactor,
      defaultRetroEffectTimings.trackingDistortionDuration * 0.8
    );
  }, effectDelay);
}
