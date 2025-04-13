import { Animation, Mesh, Color3, GlowLayer, PBRMaterial, Scene, Vector3 } from 'babylonjs';

import { gameToSceneX, gameToSceneY } from '@game/utils';

import { Ball, Player, defaultGameParams, defaultGameObjectParams } from '@shared/types';

export function applyNeonEdgeFlicker(
  scene: Scene,
  topEdgeMesh: Mesh,
  bottomEdgeMesh: Mesh,
  playerColor: Color3,
  effectIntensity: number,
  duration: number = 1500
): void {
  const edgeMaterial = topEdgeMesh.material as PBRMaterial;
  const originalEmissiveColor = edgeMaterial.emissiveColor.clone();
  const originalEmissiveIntensity = edgeMaterial.emissiveIntensity;

  const tempGlowLayer = new GlowLayer('scoreGlowLayer', scene);
  tempGlowLayer.intensity = 0;
  tempGlowLayer.blurKernelSize = 16;
  tempGlowLayer.addIncludedOnlyMesh(topEdgeMesh);
  tempGlowLayer.addIncludedOnlyMesh(bottomEdgeMesh);

  const frameRate = 60;
  const frameCount = frameRate * (duration / 1000);

  const glowAnimation = new Animation(
    'glowAnimation',
    'intensity',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const topEmissiveAnimation = new Animation(
    'topEmissiveAnimation',
    'emissiveIntensity',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  const bottomEmissiveAnimation = new Animation(
    'bottomEmissiveAnimation',
    'emissiveIntensity',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const topColorAnimation = new Animation(
    'topColorAnimation',
    'emissiveColor',
    frameRate,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  const bottomColorAnimation = new Animation(
    'bottomColorAnimation',
    'emissiveColor',
    frameRate,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  // More flickers with higher intensity
  const numFlickers = Math.floor(15 + effectIntensity * 15);

  const topKeyframes = [];
  const bottomKeyframes = [];
  const topColorKeyframes = [];
  const bottomColorKeyframes = [];

  // Generate all of the flickering patterns
  for (let i = 0; i <= numFlickers; i++) {
    const frame = (i / numFlickers) * frameCount;

    // Use random seed factor with small variation
    const randomFactor = Math.random() * 2 - 0.5;
    const topRandomFactor = randomFactor + (Math.random() * 0.5 - 0.25);
    const bottomRandomFactor = randomFactor + (Math.random() * 0.5 - 0.25);

    // Calculate flicker intensities with natural sine wave pattern and randomness
    let topFlickerIntensity =
      3 + Math.sin(i * (0.5 + effectIntensity)) * 3 * effectIntensity * topRandomFactor;
    let bottomFlickerIntensity =
      3 + Math.sin(i * (0.5 + effectIntensity)) * 3 * effectIntensity * bottomRandomFactor;

    const baseIntensity = effectIntensity * 2;
    topFlickerIntensity += baseIntensity;
    bottomFlickerIntensity += baseIntensity;

    topKeyframes.push({ frame, value: topFlickerIntensity });
    bottomKeyframes.push({ frame, value: bottomFlickerIntensity });

    const topColorMultiplier = 0.1 + Math.random() * 0.3;
    const topAnimatedColor = new Color3(
      Math.min(playerColor.r * topColorMultiplier, 1),
      Math.min(playerColor.g * topColorMultiplier, 1),
      Math.min(playerColor.b * topColorMultiplier, 1)
    );

    const bottomColorMultiplier = 0.1 + Math.random() * 0.3;
    const bottomAnimatedColor = new Color3(
      Math.min(playerColor.r * bottomColorMultiplier, 1),
      Math.min(playerColor.g * bottomColorMultiplier, 1),
      Math.min(playerColor.b * bottomColorMultiplier, 1)
    );

    topColorKeyframes.push({ frame, value: topAnimatedColor });
    bottomColorKeyframes.push({ frame, value: bottomAnimatedColor });
  }

  // Add final keyframes to return to original
  topKeyframes.push({ frame: frameCount, value: originalEmissiveIntensity });
  bottomKeyframes.push({ frame: frameCount, value: originalEmissiveIntensity });
  topColorKeyframes.push({ frame: frameCount, value: originalEmissiveColor });
  bottomColorKeyframes.push({ frame: frameCount, value: originalEmissiveColor });

  topEmissiveAnimation.setKeys(topKeyframes);
  bottomEmissiveAnimation.setKeys(bottomKeyframes);
  topColorAnimation.setKeys(topColorKeyframes);
  bottomColorAnimation.setKeys(bottomColorKeyframes);

  const topMaterial = topEdgeMesh.material as PBRMaterial;
  const bottomMaterial = bottomEdgeMesh.material as PBRMaterial;
  topMaterial.animations = [topEmissiveAnimation, topColorAnimation];
  bottomMaterial.animations = [bottomEmissiveAnimation, bottomColorAnimation];

  const glowKeyframes = [];
  for (let i = 0; i <= numFlickers; i++) {
    const frame = (i / numFlickers) * frameCount;
    const baseIntensity = 0.5 + effectIntensity;
    const randomFactor = Math.random() * 0.5;

    const flickerIntensity =
      baseIntensity + Math.sin(i * (0.5 + effectIntensity)) * effectIntensity * randomFactor;

    glowKeyframes.push({ frame, value: flickerIntensity });
  }

  // Add final keyframe to return to original
  glowKeyframes.push({ frame: frameCount, value: 0 });
  glowAnimation.setKeys(glowKeyframes);

  scene.beginAnimation(topMaterial, 0, frameCount, false);
  scene.beginAnimation(bottomMaterial, 0, frameCount, false);
  scene.beginDirectAnimation(tempGlowLayer, [glowAnimation], 0, frameCount, false);

  setTimeout(() => {
    topMaterial.emissiveColor = originalEmissiveColor;
    topMaterial.emissiveIntensity = originalEmissiveIntensity;
    bottomMaterial.emissiveColor = originalEmissiveColor;
    bottomMaterial.emissiveIntensity = originalEmissiveIntensity;
    tempGlowLayer.dispose();
  }, duration);
}

export function applyPaddleRecoil(
  scene: Scene,
  paddle: Mesh,
  intensity: number,
  scoringDirection: 'left' | 'right',
  ballY: number,
  paddleY: number,
  paddleHeight: number,
  duration: number = 1000
): void {
  const originalPosition = paddle.position.clone();
  const originalRotation = paddle.rotation.clone();

  const frameRate = 60;
  const frameCount = frameRate * (duration / 1000);
  const paddleCenter = paddleY + paddleHeight / 2;

  const xDirectionMultiplier = scoringDirection === 'right' ? -1 : 1;
  const zDirectionMultiplier = ballY < paddleCenter ? -1 : 1;

  const positionAnimation = new Animation(
    'paddleRecoilPosition',
    'position',
    frameRate,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  const rotationAnimation = new Animation(
    'paddleRecoilRotation',
    'rotation',
    frameRate,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const offsetAmount = 2 + intensity * 2;
  const finalOffset = offsetAmount * xDirectionMultiplier;
  const finalRotation = (Math.PI / 12) * intensity * 2;

  const offsetPosition = originalPosition.clone();
  offsetPosition.x += finalOffset;

  const maxRotVector = originalRotation.clone();
  maxRotVector.z += finalRotation * zDirectionMultiplier;

  // Generate keyframes for position
  const positionKeys = [];
  positionKeys.push({
    frame: 0,
    value: originalPosition.clone(),
  });
  positionKeys.push({
    frame: frameCount * 0.25,
    value: offsetPosition,
  });
  positionKeys.push({
    frame: frameCount,
    value: originalPosition.clone(),
  });

  // Generate keyframes for rotation
  const rotationKeys = [];
  rotationKeys.push({
    frame: 0,
    value: originalRotation.clone(),
  });
  rotationKeys.push({
    frame: frameCount * 0.25,
    value: maxRotVector,
  });
  rotationKeys.push({
    frame: frameCount,
    value: originalRotation.clone(),
  });

  positionAnimation.setKeys(positionKeys);
  rotationAnimation.setKeys(rotationKeys);

  paddle.animations = [positionAnimation, rotationAnimation];

  scene.beginAnimation(paddle, 0, frameCount, false);

  setTimeout(() => {
    paddle.rotation = originalRotation.clone();

    const gameWidth = defaultGameParams.dimensions.gameWidth;
    const gameHeight = defaultGameParams.dimensions.gameHeight;
    const middleY = gameHeight / 2 - paddleHeight / 2;
    const isPlayer1 = originalPosition.x < 0;

    if (isPlayer1) {
      paddle.position = new Vector3(
        gameToSceneX(0, paddle),
        gameToSceneY(middleY, paddle),
        defaultGameObjectParams.distanceFromFloor
      );
    } else {
      paddle.position = new Vector3(
        gameToSceneX(gameWidth, paddle),
        gameToSceneY(middleY, paddle),
        defaultGameObjectParams.distanceFromFloor
      );
    }
  }, duration);
}

function calculateScoreEffectIntensity(
  playerScore: number,
  ballSpeed: number,
  ballSpin: number
): number {
  // Base intensity from player's current score (0.1 to 0.3)
  const maxScore = defaultGameParams.rules.maxScore;
  const scoreIntensity = Math.min(0.1 + (playerScore / maxScore) * 0.3, 0.3);

  // Add intensity based on how close the game is to ending (0.1 to 0.3)
  const remainingPoints = maxScore - playerScore;
  const endgameIntensity = Math.max(0.1, 0.3 * (1 - remainingPoints / maxScore));

  // Add intensity based on ball physics (0 to 0.4)
  const normalizedSpeed = Math.min(Math.max(ballSpeed / 15, 0), 1);
  const normalizedSpin = Math.min(Math.abs(ballSpin) / 10, 1);
  const physicsIntensity = normalizedSpeed * 0.2 + normalizedSpin * 0.2;

  // Return combined factor (ensure result is between 0.1 and 1.0)
  return Math.min(scoreIntensity + endgameIntensity + physicsIntensity, 1.0);
}

export function applyScoreEffects(
  retroEffectsRef: any,
  scene: Scene,
  topEdge: Mesh,
  bottomEdge: Mesh,
  scoringPlayerPaddle: Mesh,
  scoredAgainstPaddle: Mesh,
  playerScore: number,
  players: { player1: Player; player2: Player },
  ball: Ball,
  primaryColor: Color3
) {
  if (retroEffectsRef) {
    setTimeout(() => {
      retroEffectsRef?.changeChannel(1200).then(() => {});
    }, 300);
  }

  const ballSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
  const ballDirection: 'left' | 'right' = ball.dx > 0 ? 'right' : 'left';
  const intensity = calculateScoreEffectIntensity(playerScore, ballSpeed, ball.spin);

  applyNeonEdgeFlicker(scene, topEdge, bottomEdge, primaryColor, intensity);

  if (scene && scoredAgainstPaddle && players) {
    const scoredAgainstPlayer = ballDirection === 'right' ? 'player1' : 'player2';
    const paddleY = players[scoredAgainstPlayer].y;
    const paddleHeight = players[scoredAgainstPlayer].paddleHeight;

    applyPaddleRecoil(
      scene,
      scoredAgainstPaddle,
      intensity,
      ballDirection,
      ball.y,
      paddleY,
      paddleHeight
    );
  }
}
