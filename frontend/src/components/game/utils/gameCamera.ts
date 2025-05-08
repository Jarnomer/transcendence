import {
  Animation,
  ArcRotateCamera,
  CubicEase,
  EasingFunction,
  KeyboardEventTypes,
  Scene,
  Vector3,
} from 'babylonjs';

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
  // {
  //   alpha: 0.8,
  //   beta: Math.PI / 4,
  //   radius: 45,
  //   target: new Vector3(5, -5, 5),
  // },
  // {
  //   alpha: Math.PI / 12,
  //   beta: Math.PI / 2.8,
  //   radius: 25,
  //   target: new Vector3(2, -3, 0),
  // },
  // {
  //   alpha: 0,
  //   beta: Math.PI / 2.5,
  //   radius: 15,
  //   target: new Vector3(5, 0, 0),
  // },
  // {
  //   alpha: -Math.PI / 3,
  //   beta: Math.PI / 4,
  //   radius: 32,
  //   target: new Vector3(10, -4, 12),
  // },
  // {
  //   alpha: -Math.PI / 4,
  //   beta: Math.PI / 6,
  //   radius: 25,
  //   target: new Vector3(5, -2, 0),
  // },
  // {
  //   alpha: Math.PI / 6,
  //   beta: Math.PI / 3,
  //   radius: 35,
  //   target: new Vector3(-2, -5, -10),
  // },
  {
    alpha: -0.5,
    beta: Math.PI / 3,
    radius: 30,
    target: new Vector3(10, 3, 10),
  },
];

export const gameplayCameraAngles: ArcCameraAngle[] = [
  {
    // Gameplay background view
    alpha: 0,
    beta: 0,
    radius: 0,
    target: new Vector3(0, 0, -100),
  },
  {
    // Player 1 perspective
    alpha: Math.PI / 8,
    beta: Math.PI / 3,
    radius: 35,
    target: new Vector3(-2, -9, -6),
  },
  {
    // Player 2 perspective
    alpha: -Math.PI / 8,
    beta: Math.PI / 3,
    radius: 35,
    target: new Vector3(-2, -9, 10),
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

/**
 * Adds debug controls to an ArcRotateCamera
 *
 * Controls:
 * - Arrow keys: Adjust alpha (left/right) and beta (up/down)
 * - +/-: Adjust radius (distance)
 * - WASD: Adjust target position (x/y)
 * - Q/E: Adjust target position (z)
 * - R: Reset to initial values
 * - P: Print current values to console
 */
export function addCameraDebugControls(
  camera: ArcRotateCamera,
  scene: Scene,
  enabled: boolean = false
): () => void {
  if (!enabled) return () => {};

  // Store initial camera values
  const initialValues = {
    alpha: camera.alpha,
    beta: camera.beta,
    radius: camera.radius,
    targetX: camera.target.x,
    targetY: camera.target.y,
    targetZ: camera.target.z,
  };

  if (enabled) console.log('Camera Debug Controls Enabled');

  // Set step values for adjustments
  const alphaStep = 0.05;
  const betaStep = 0.05;
  const radiusStep = 1;
  const targetStep = 1;

  // Create observer for key presses
  const keyboardObserver = scene.onKeyboardObservable.add((kbInfo) => {
    if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
      switch (kbInfo.event.key) {
        case 'ArrowLeft':
          camera.alpha -= alphaStep;
          break;
        case 'ArrowRight':
          camera.alpha += alphaStep;
          break;
        case 'ArrowUp':
          camera.beta = Math.max(0.1, camera.beta - betaStep);
          break;
        case 'ArrowDown':
          camera.beta = Math.min(Math.PI - 0.1, camera.beta + betaStep);
          break;
        case '+':
        case '=':
          camera.radius -= radiusStep;
          break;
        case '-':
        case '_':
          camera.radius += radiusStep;
          break;
        case 'a':
          camera.target.x -= targetStep;
          break;
        case 'd':
          camera.target.x += targetStep;
          break;
        case 'w':
          camera.target.y += targetStep;
          break;
        case 's':
          camera.target.y -= targetStep;
          break;
        case 'q':
          camera.target.z -= targetStep;
          break;
        case 'e':
          camera.target.z += targetStep;
          break;
        case 'r':
          camera.alpha = initialValues.alpha;
          camera.beta = initialValues.beta;
          camera.radius = initialValues.radius;
          camera.target = new Vector3(
            initialValues.targetX,
            initialValues.targetY,
            initialValues.targetZ
          );
          console.log('Camera reset to initial values');
          break;
        case 'p':
          printCameraValues(camera);
          break;
      }
    }
  });

  // Return a function to disable the controls
  return () => {
    if (keyboardObserver) {
      scene.onKeyboardObservable.remove(keyboardObserver);
      console.log('Camera Debug Controls Disabled');
    }
  };
}

function printCameraValues(camera: ArcRotateCamera): void {
  console.log('Current Camera Values:');
  console.log(`{
  alpha: ${camera.alpha.toFixed(2)},
  beta: ${camera.beta.toFixed(2)},
  radius: ${camera.radius.toFixed(2)},
  target: new Vector3(${camera.target.x.toFixed(2)}, ${camera.target.y.toFixed(2)}, ${camera.target.z.toFixed(2)}),
},`);
}
