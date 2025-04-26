import { Animation, ArcRotateCamera, CubicEase, EasingFunction, Scene, Vector3 } from 'babylonjs';

import { defaultGameAnimationTimings } from '@shared/types';

let lastCameraAngleIndex = -1;
let lastGameplayCameraAngleIndex = -1;

export interface ArcCameraAngle {
  alpha: number; // Horizontal rotation in radians
  beta: number; // Vertical rotation in radians
  radius: number; // Distance from target
  target: Vector3; // Target position
}

export const cinematicCameraAngles: ArcCameraAngle[] = [
  {
    alpha: -0.5,
    beta: 1.1,
    radius: 30,
    target: new Vector3(10, 3, 10),
  },
  // {
  //   alpha: -1,
  //   beta: 1.1,
  //   radius: 30,
  //   target: new Vector3(1, 1, 5),
  // },
];

export const gameplayCameraAngles: ArcCameraAngle[] = [
  {
    // Background view
    alpha: 0,
    beta: 0,
    radius: 0,
    target: new Vector3(0, 0, -100),
  },
  {
    // Player 2 perspective
    alpha: 0,
    beta: Math.PI / 3,
    radius: 20,
    target: new Vector3(5, 0, 0),
  },
  {
    // Player 1 perspective
    alpha: -Math.PI,
    beta: Math.PI / 3,
    radius: 20,
    target: new Vector3(-5, 0, 0),
  },
];

export function setupSceneCamera(scene: Scene): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 2,
    Math.PI / 2,
    28,
    new Vector3(0, 0, -5),
    scene
  );

  camera.detachControl();

  return camera;
}

export function applyCameraShake(
  scene: Scene,
  camera: ArcRotateCamera,
  intensity: number,
  effectDelay: number,
  duration: number = 500,
  decayFactor: number = 0.95
): void {
  const initialTarget = camera.target.clone();
  const maxShakeAmount = intensity * 0.2;

  setTimeout(() => {
    let shakeTime = 0;
    const startTime = Date.now();
    const endTime = startTime + duration;

    const shakeObserver = scene.onBeforeRenderObservable.add(() => {
      const currentTime = Date.now();
      shakeTime = currentTime - startTime;

      if (currentTime >= endTime) {
        // Restore camera position and remove observer
        camera.target = initialTarget.clone();
        scene.onBeforeRenderObservable.remove(shakeObserver);
        return;
      }

      const timeRatio = shakeTime / duration; // Calculate decay over time
      const currentIntensity = intensity * Math.pow(1 - timeRatio, decayFactor);

      const randomX = (Math.random() * 2 - 1) * maxShakeAmount * currentIntensity;
      const randomY = (Math.random() * 2 - 1) * maxShakeAmount * currentIntensity;
      const randomZ = (Math.random() * 2 - 1) * maxShakeAmount * currentIntensity * 0.5;

      camera.target = initialTarget.clone().add(new Vector3(randomX, randomY, randomZ));
    });
  }, effectDelay);
}

export const getNextCinematicCameraAngle = (): ArcCameraAngle => {
  lastCameraAngleIndex = (lastCameraAngleIndex + 1) % cinematicCameraAngles.length;
  return cinematicCameraAngles[lastCameraAngleIndex];
};

export const getNextGameplayCameraAngle = (): ArcCameraAngle => {
  lastGameplayCameraAngleIndex = (lastGameplayCameraAngleIndex + 1) % gameplayCameraAngles.length;
  return gameplayCameraAngles[lastGameplayCameraAngleIndex];
};

export function applyCinematicCameraAngle(camera: ArcRotateCamera, cameraAngle: ArcCameraAngle) {
  if (!cameraAngle) return;

  camera.alpha = cameraAngle.alpha;
  camera.beta = cameraAngle.beta;
  camera.radius = cameraAngle.radius;
  camera.target = cameraAngle.target.clone();
}

export const animateCinematicCamera = (
  camera: ArcRotateCamera,
  targetAngle: ArcCameraAngle,
  duration: number = defaultGameAnimationTimings.camera.cameraTransitionDuration
) => {
  const scene = camera.getScene();
  const animations = [];

  // Alpha animation
  const alphaAnimation = new Animation(
    'cameraAlphaAnimation',
    'alpha',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  alphaAnimation.setKeys([
    { frame: 0, value: camera.alpha },
    { frame: 100, value: targetAngle.alpha },
  ]);
  animations.push({
    animation: alphaAnimation,
    target: camera,
  });

  // Beta animation
  const betaAnimation = new Animation(
    'cameraBetaAnimation',
    'beta',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  betaAnimation.setKeys([
    { frame: 0, value: camera.beta },
    { frame: 100, value: targetAngle.beta },
  ]);
  animations.push({
    animation: betaAnimation,
    target: camera,
  });

  // Radius animation
  const radiusAnimation = new Animation(
    'cameraRadiusAnimation',
    'radius',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  radiusAnimation.setKeys([
    { frame: 0, value: camera.radius },
    { frame: 100, value: targetAngle.radius },
  ]);
  animations.push({
    animation: radiusAnimation,
    target: camera,
  });

  // Target animation
  const targetAnimation = new Animation(
    'cameraTargetAnimation',
    'target',
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  targetAnimation.setKeys([
    { frame: 0, value: camera.target.clone() },
    { frame: 100, value: targetAngle.target },
  ]);
  animations.push({
    animation: targetAnimation,
    target: camera,
  });

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

  animations.forEach((anim) => {
    anim.animation.setEasingFunction(easingFunction);
  });

  const animationTables = animations.map((anim) => {
    return scene.beginDirectAnimation(
      anim.target,
      [anim.animation],
      0,
      100,
      false,
      (1000 / duration) * 100
    );
  });

  return animationTables;
};

export function applyGameplayCameraAngle(camera: ArcRotateCamera, arcAngle: ArcCameraAngle) {
  if (!arcAngle) return;

  camera.alpha = arcAngle.alpha;
  camera.beta = arcAngle.beta;
  camera.radius = arcAngle.radius;
  camera.target = arcAngle.target.clone();
}

export function animateGameplayCamera(
  camera: ArcRotateCamera,
  targetAngle: ArcCameraAngle,
  duration: number = defaultGameAnimationTimings.camera.cameraTransitionDuration
) {
  const scene = camera.getScene();
  const animations = [];

  // Alpha animation
  const alphaAnimation = new Animation(
    'cameraAlphaAnimation',
    'alpha',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  alphaAnimation.setKeys([
    { frame: 0, value: camera.alpha },
    { frame: 100, value: targetAngle.alpha },
  ]);
  animations.push({
    animation: alphaAnimation,
    target: camera,
  });

  // Beta animation
  const betaAnimation = new Animation(
    'cameraBetaAnimation',
    'beta',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  betaAnimation.setKeys([
    { frame: 0, value: camera.beta },
    { frame: 100, value: targetAngle.beta },
  ]);
  animations.push({
    animation: betaAnimation,
    target: camera,
  });

  // Radius animation
  const radiusAnimation = new Animation(
    'cameraRadiusAnimation',
    'radius',
    30,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  radiusAnimation.setKeys([
    { frame: 0, value: camera.radius },
    { frame: 100, value: targetAngle.radius },
  ]);
  animations.push({
    animation: radiusAnimation,
    target: camera,
  });

  // Target animation
  const targetAnimation = new Animation(
    'cameraTargetAnimation',
    'target',
    30,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  targetAnimation.setKeys([
    { frame: 0, value: camera.target.clone() },
    { frame: 100, value: targetAngle.target },
  ]);
  animations.push({
    animation: targetAnimation,
    target: camera,
  });

  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

  animations.forEach((anim) => {
    anim.animation.setEasingFunction(easingFunction);
  });

  const animationTables = animations.map((anim) => {
    return scene.beginDirectAnimation(
      anim.target,
      [anim.animation],
      0,
      100,
      false,
      (1000 / duration) * 100
    );
  });

  return animationTables;
}
