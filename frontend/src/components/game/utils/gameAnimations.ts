import {
  Animation,
  AnimationGroup,
  Mesh,
  Scene,
  EasingFunction,
  CubicEase,
  Vector3,
  ArcRotateCamera,
} from 'babylonjs';

import { gameToSceneSize, gameToSceneX, gameToSceneY } from '@game/utils';

import { defaultGameParams, GameObjectParams, defaultGameObjectParams, Ball } from '@shared/types';

export function applyHoverAnimation(
  mesh: Mesh,
  scene: Scene,
  params: {
    bottomValue: number;
    topValue: number;
  },
  autoStart: boolean = true
): Animation {
  const frameRate = 30;
  const hoverAnimation = new Animation(
    `${mesh.name}HoverAnimation`,
    'position.z',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const keys = [];
  keys.push({ frame: 0, value: params.bottomValue });
  keys.push({ frame: frameRate, value: params.topValue });
  keys.push({ frame: frameRate * 2, value: params.bottomValue });

  hoverAnimation.setKeys(keys);

  // Store animations in metadata for future reference
  if (!mesh.metadata) mesh.metadata = {};

  mesh.metadata.hoverAnimation = hoverAnimation;
  mesh.metadata.hoverFrameRate = frameRate;

  mesh.animations = [hoverAnimation];

  if (autoStart) {
    scene.beginAnimation(mesh, 0, frameRate * 2, true);
  }

  return hoverAnimation;
}

export function createPaddleHoverAnimation(
  paddle: Mesh,
  scene: Scene,
  params: GameObjectParams = defaultGameObjectParams
): Animation {
  return applyHoverAnimation(paddle, scene, params.paddle.animation);
}

export function createBallHoverAnimation(
  ball: Mesh,
  scene: Scene,
  params: GameObjectParams = defaultGameObjectParams
): Animation {
  return applyHoverAnimation(ball, scene, params.ball.animation);
}

export function createEdgeHoverAnimation(
  edge: Mesh,
  scene: Scene,
  params: GameObjectParams = defaultGameObjectParams
): Animation {
  return applyHoverAnimation(edge, scene, params.edge.animation);
}

export function restartHoverAnimation(mesh: Mesh, scene: Scene): void {
  if (mesh && mesh.metadata && mesh.metadata.hoverAnimation) {
    mesh.animations = [mesh.metadata.hoverAnimation];
    scene.beginAnimation(mesh, 0, mesh.metadata.hoverFrameRate * 2, true);
  }
}

export function createFloorHoverAnimation(floor: Mesh, scene: Scene): AnimationGroup {
  const frameRate = 30;
  const animationDuration = frameRate * 3;
  const baseTiltAmount = 0.006;
  const baseFloatAmount = 0.12;

  // Add subtle random variations (±20% variation)
  const randomFactor = () => 0.8 + Math.random() * 0.4;
  const phaseOffset = () => Math.random() * animationDuration * 0.25;

  const tiltAmountY = baseTiltAmount * randomFactor();
  const tiltAmountZ = baseTiltAmount * 0.5 * randomFactor();
  const floatAmount = baseFloatAmount * randomFactor();

  const animationGroup = new AnimationGroup('floorAnimations', scene);

  const rotationAnimationY = new Animation(
    'floorRotationAnimationY',
    'rotation.y',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const rotationAnimationZ = new Animation(
    'floorRotationAnimationZ',
    'rotation.z',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const positionAnimation = new Animation(
    'floorPositionAnimation',
    'position.y',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  // Apply slightly different timings
  const offsetY = phaseOffset();
  const offsetZ = phaseOffset();
  const offsetPos = phaseOffset();

  const rotationKeysY = [];
  rotationKeysY.push({ frame: 0 + offsetY, value: 0 });
  rotationKeysY.push({ frame: animationDuration / 2 + offsetY, value: tiltAmountY });
  rotationKeysY.push({ frame: animationDuration + offsetY, value: 0 });
  rotationKeysY.push({ frame: animationDuration * 1.5 + offsetY, value: -tiltAmountY });
  rotationKeysY.push({ frame: animationDuration * 2 + offsetY, value: 0 });

  const rotationKeysZ = [];
  rotationKeysZ.push({ frame: 0 + offsetZ, value: 0 });
  rotationKeysZ.push({ frame: animationDuration / 3 + offsetZ, value: tiltAmountZ });
  rotationKeysZ.push({ frame: animationDuration + offsetZ, value: 0 });
  rotationKeysZ.push({ frame: (animationDuration * 5) / 3 + offsetZ, value: -tiltAmountZ });
  rotationKeysZ.push({ frame: animationDuration * 2 + offsetZ, value: 0 });

  const positionKeys = [];
  const initialPositionY = floor.position.y || 0;
  positionKeys.push({ frame: 0 + offsetPos, value: initialPositionY });
  positionKeys.push({
    frame: animationDuration / 2 + offsetPos,
    value: initialPositionY - floatAmount,
  });
  positionKeys.push({ frame: animationDuration + offsetPos, value: initialPositionY });
  positionKeys.push({
    frame: animationDuration * 1.5 + offsetPos,
    value: initialPositionY + floatAmount,
  });
  positionKeys.push({ frame: animationDuration * 2 + offsetPos, value: initialPositionY });

  rotationAnimationY.setKeys(rotationKeysY);
  rotationAnimationZ.setKeys(rotationKeysZ);
  positionAnimation.setKeys(positionKeys);

  const easingY = new CubicEase();
  easingY.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  rotationAnimationY.setEasingFunction(easingY);

  const easingZ = new CubicEase();
  easingZ.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  rotationAnimationZ.setEasingFunction(easingZ);

  animationGroup.addTargetedAnimation(rotationAnimationY, floor);
  animationGroup.addTargetedAnimation(rotationAnimationZ, floor);
  animationGroup.addTargetedAnimation(positionAnimation, floor);

  animationGroup.speedRatio = 0.5;

  animationGroup.play(true); // Loop forever

  // Store animations in metadata for future reference
  if (!floor.metadata) floor.metadata = {};

  floor.metadata.hoverAnimationGroup = animationGroup;
  floor.metadata.hoverFrameRate = frameRate;
  floor.metadata.animationDuration = animationDuration;

  return animationGroup;
}

export function animateBallAfterScore(
  scene: Scene,
  ballMesh: Mesh,
  ballState: Ball,
  camera: ArcRotateCamera,
  scoringPlayer: 'player1' | 'player2',
  gameWidth: number = defaultGameParams.dimensions.gameWidth,
  gameHeight: number = defaultGameParams.dimensions.gameHeight,
  scaleFactor: number = defaultGameParams.dimensions.scaleFactor,
  onAnimationComplete?: () => void
): void {
  const ballX = ballMesh.position.x;
  const ballY = ballMesh.position.y;
  const ballZ = ballMesh.position.z;

  const ballDx = ballState.dx / scaleFactor;
  const ballDy = -ballState.dy / scaleFactor;

  const frameRate = 30;

  // Continue movement animation
  const continueStartPos = new Vector3(ballX, ballY, ballZ);
  const continueFinalPos = new Vector3(
    ballX + ballDx * frameRate,
    ballY + ballDy * frameRate,
    ballZ
  );

  const continueAnim = new Animation(
    'ballContinueMovement',
    'position',
    frameRate,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const continueKeys = [
    { frame: 0, value: continueStartPos },
    { frame: frameRate, value: continueFinalPos },
  ];
  continueAnim.setKeys(continueKeys);

  // Drop animation setup
  const cameraPos = camera.position.clone();
  const cameraTarget = camera.target.clone();
  const centerX = gameToSceneX(gameWidth / 2, ballMesh);
  const centerY = gameToSceneY(gameHeight / 2, ballMesh);

  const distanceBehindCamera = 8;
  const xOffsetAmount = 3;

  const xOffset = scoringPlayer === 'player1' ? xOffsetAmount : -xOffsetAmount;
  const cameraDirection = cameraPos.subtract(cameraTarget).normalize();
  const dropStartPos = cameraPos.add(cameraDirection.scale(distanceBehindCamera));
  const dropFinalPos = new Vector3(centerX, centerY, ballZ);

  dropStartPos.x = centerX + xOffset;
  dropStartPos.z += 5;

  const dropAnim = new Animation(
    'ballDropAnimation',
    'position',
    frameRate,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  const dropKeys = [
    { frame: 0, value: dropStartPos },
    { frame: frameRate, value: dropFinalPos },
  ];
  dropAnim.setKeys(dropKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  dropAnim.setEasingFunction(easingFunction);

  // Execute animations in sequence
  ballMesh.animations = [continueAnim];
  scene.beginAnimation(ballMesh, 0, frameRate, false, 1, () => {
    ballMesh.position = dropStartPos;
    ballMesh.animations = [dropAnim];
    scene.beginAnimation(ballMesh, 0, frameRate, false, 1, () => {
      // Restart hover animation after drop completes
      restartHoverAnimation(ballMesh, scene);

      if (onAnimationComplete) onAnimationComplete();
    });
  });
}

export function animatePaddleAfterScore(
  scene: Scene,
  paddle: Mesh,
  camera: ArcRotateCamera,
  scoringDirection: 'left' | 'right',
  onAnimationComplete?: () => void
): void {
  const frameRate = 30;
  const gameWidth = defaultGameParams.dimensions.gameHeight;

  const centerX = gameToSceneX(scoringDirection === 'right' ? gameWidth : 0, paddle);
  const centerY = 0;
  const paddleZ = paddle.position.z;

  const cameraPos = camera.position.clone();
  const cameraTarget = camera.target.clone();

  const distanceBehindCamera = 8;
  const xOffsetAmount = 3;

  const xOffset = scoringDirection === 'right' ? xOffsetAmount : -xOffsetAmount;
  const cameraDirection = cameraPos.subtract(cameraTarget).normalize();
  const dropStartPos = cameraPos.add(cameraDirection.scale(distanceBehindCamera));
  const dropFinalPos = new Vector3(centerX, centerY, paddleZ);

  dropStartPos.x = centerX + xOffset;
  dropStartPos.z += 5;

  paddle.position = dropStartPos;
  paddle.visibility = 1;

  const dropAnim = new Animation(
    'paddleDropAnimation',
    'position',
    frameRate,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const dropKeys = [
    { frame: 0, value: dropStartPos },
    { frame: frameRate, value: dropFinalPos },
  ];

  dropAnim.setKeys(dropKeys);

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  dropAnim.setEasingFunction(easingFunction);

  paddle.animations = [dropAnim];
  scene.beginAnimation(paddle, 0, frameRate, false, 1, () => {
    // Restart hover animation after drop completes
    restartHoverAnimation(paddle, scene);

    if (onAnimationComplete) onAnimationComplete();
  });
}
