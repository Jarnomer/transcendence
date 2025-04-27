import {
  Animation,
  Mesh,
  Scene,
  Color3,
  EasingFunction,
  AnimationGroup,
  CubicEase,
  Vector3,
  ArcRotateCamera,
} from 'babylonjs';

import { GameAnimationManager, gameToSceneX, gameToSceneY } from '@game/utils';

import {
  AnimationPriority,
  AnimationGrouping,
  AnimationOptions,
  GameObjectParams,
  Ball,
  defaultGameParams,
  defaultGameObjectParams,
} from '@shared/types';

export class ResourceTracker {
  private resources: Array<{ dispose: () => void }> = [];

  track<T extends { dispose: () => void }>(resource: T): T {
    this.resources.push(resource);
    return resource;
  }

  disposeAll(): void {
    while (this.resources.length) {
      const resource = this.resources.pop();
      if (resource) resource.dispose();
    }
  }
}

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

  applyCubicEaseInOut(rotationAnimationY);
  applyCubicEaseInOut(rotationAnimationY);

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
  applyCubicEaseInOut(dropAnim);

  // Execute animations in sequence
  ballMesh.animations = [continueAnim];
  scene.beginAnimation(ballMesh, 0, frameRate, false, 1, () => {
    ballMesh.position = dropStartPos;
    ballMesh.visibility = 1;
    ballMesh.animations = [dropAnim];
    scene.beginAnimation(ballMesh, 0, frameRate, false, 1, () => {
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
  const gameWidth = defaultGameParams.dimensions.gameWidth;

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
  applyCubicEaseInOut(dropAnim);
  paddle.animations = [dropAnim];

  scene.beginAnimation(paddle, 0, frameRate, false, 1, () => {
    restartHoverAnimation(paddle, scene);
    if (onAnimationComplete) onAnimationComplete();
  });
}

export function applyCubicEaseInOut(animation: Animation): void {
  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  animation.setEasingFunction(easingFunction);
}

export function createCubicEaseInOut(): CubicEase {
  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  return easingFunction;
}

export function applyEasing(
  animation: Animation,
  easingMode: number = EasingFunction.EASINGMODE_EASEINOUT
): void {
  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(easingMode);
  animation.setEasingFunction(easingFunction);
}

export function createHoverAnimation(
  mesh: Mesh,
  scene: Scene,
  params: {
    minHeight: number;
    maxHeight: number;
    duration?: number;
    property?: string;
  },
  options: AnimationOptions = {}
): void {
  const { minHeight, maxHeight, duration = 2.0, property = 'position.z' } = params;

  const animManager = GameAnimationManager.getInstance(scene);
  const frameRate = 30;
  const totalFrames = frameRate * duration;

  const keyframes = [
    { frame: 0, value: minHeight },
    { frame: totalFrames / 2, value: maxHeight },
    { frame: totalFrames, value: minHeight },
  ];

  const defaultOptions: AnimationOptions = {
    priority: AnimationPriority.LOWEST,
    group: AnimationGrouping.HOVER,
    loop: true,
    easingMode: EasingFunction.EASINGMODE_EASEINOUT,
  };

  const animOptions = { ...defaultOptions, ...options };

  animManager.animate(mesh, property, keyframes, animOptions);
}

export function animateSpringScale(
  mesh: Mesh,
  scene: Scene,
  targetScale: Vector3,
  options: AnimationOptions = {}
): void {
  const animManager = GameAnimationManager.getInstance(scene);
  const currentScale = mesh.scaling.clone();

  const keyframes = [
    { frame: 0, value: currentScale },
    { frame: 5, value: new Vector3(targetScale.x * 1.2, targetScale.y * 1.2, targetScale.z * 1.2) },
    {
      frame: 15,
      value: new Vector3(targetScale.x * 0.9, targetScale.y * 0.9, targetScale.z * 0.9),
    },
    { frame: 30, value: targetScale },
  ];

  const defaultOptions: AnimationOptions = {
    priority: AnimationPriority.HIGH,
    group: AnimationGrouping.SCALE,
    easingMode: EasingFunction.EASINGMODE_EASEINOUT,
  };

  const animOptions = { ...defaultOptions, ...options };

  animManager.animate(mesh, 'scaling', keyframes, animOptions);
}

export function createStandardAnimation(
  name: string,
  targetProperty: string,
  frameRate: number,
  keyframes: any[],
  loopMode = Animation.ANIMATIONLOOPMODE_CONSTANT,
  easingMode = EasingFunction.EASINGMODE_EASEINOUT
): Animation {
  let animationType = Animation.ANIMATIONTYPE_FLOAT;
  if (keyframes.length > 0) {
    const value = keyframes[0].value;
    if (value instanceof Vector3) {
      animationType = Animation.ANIMATIONTYPE_VECTOR3;
    } else if (value instanceof Color3) {
      animationType = Animation.ANIMATIONTYPE_COLOR3;
    }
  }

  const animation = new Animation(name, targetProperty, frameRate, animationType, loopMode);

  animation.setKeys(keyframes);

  if (easingMode !== null) applyCubicEaseInOut(animation);

  return animation;
}
