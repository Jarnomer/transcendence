import { RetroEffectsManager } from '@game/utils';

import { defaultGameParams, defaultRetroEffectTimings } from '@shared/types';

function calculateEffectIntensity(
  playerScore: number,
  ballSpeed: number,
  ballSpin: number
): number {
  const baseIntensity = 2.0;

  const maxScore = defaultGameParams.rules.maxScore;
  const scoreIntensity = (playerScore / maxScore) * 0.5;

  const remainingPoints = maxScore - playerScore;
  const endgameIntensity = 0.5 * (1 - remainingPoints / maxScore);

  const normalizedSpeed = Math.min(Math.max(ballSpeed / 15, 0), 1);
  const normalizedSpin = Math.min(Math.abs(ballSpin) / 10, 1);

  const physicsIntensity = normalizedSpeed * 1.5 + normalizedSpin * 0.5;

  return Math.min(baseIntensity + scoreIntensity + endgameIntensity + physicsIntensity, 5.0);
}

export function applyBackgroundCollisionEffects(
  retroEffectsRef: RetroEffectsManager | null | undefined,
  speed: number,
  spin: number,
  applyGlitch: boolean = true
): void {
  if (!retroEffectsRef || !applyGlitch) return;
  const baseFactor = 0.5;

  const speedFactor = Math.min(Math.max(speed / 5, 1.0), 3.0);
  const spinFactor = Math.min(Math.max(spin / 5, 0.5), 2.0);
  const combinedFactor = Math.min(Math.max((speedFactor + spinFactor) / 5, 0.5), 1.0);

  retroEffectsRef.setGlitchAmount(
    baseFactor + combinedFactor,
    defaultRetroEffectTimings.collisionGlitchDuration
  );
}

export function applyBackgroundScoreEffects(
  retroEffectsRef: RetroEffectsManager | null | undefined,
  playerScore: number,
  ballSpeed: number,
  ballSpin: number
): void {
  if (!retroEffectsRef) return;

  const totalDuration = 1800;

  const intensityFactor = calculateEffectIntensity(playerScore, ballSpeed, ballSpin);
  const numberOfGlitches = Math.floor(10 + (intensityFactor - 2) * 4);

  const glitchTimers: number[] = [];

  const createGlitch = (remainingGlitches: number, elapsedTime: number) => {
    if (remainingGlitches <= 0 || elapsedTime >= totalDuration || !retroEffectsRef) return;

    const minInterval = 30;
    const maxInterval = 250 / (intensityFactor / 2);
    const interval = Math.max(minInterval, Math.floor(Math.random() * maxInterval) + 30);

    if (elapsedTime + interval > totalDuration) return;

    const timerId = window.setTimeout(() => {
      if (!retroEffectsRef) return;

      const glitchStrength = intensityFactor * (0.7 + Math.random() * 0.6);
      const glitchDuration = 40 + Math.random() * 60 * (intensityFactor / 3.0);

      retroEffectsRef.setGlitchAmount(glitchStrength, glitchDuration);

      if (Math.random() > 0.6) {
        retroEffectsRef.simulateTrackingDistortion(
          glitchStrength * 0.8,
          defaultRetroEffectTimings.trackingDistortionDuration * 0.5
        );
      }

      createGlitch(remainingGlitches - 1, elapsedTime + interval);
    }, interval);

    glitchTimers.push(timerId);
  };

  createGlitch(numberOfGlitches, 0);

  setTimeout(() => {
    // Clean up any remaining timers after the effect duration
    glitchTimers.forEach((timerId) => window.clearTimeout(timerId));
  }, totalDuration + 100);
}
