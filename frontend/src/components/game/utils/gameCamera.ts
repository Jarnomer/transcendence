import {
  ArcRotateCamera,
  Animation,
  Camera,
  CubicEase,
  DefaultRenderingPipeline,
  EasingFunction,
  MotionBlurPostProcess,
  Scene,
  Vector3,
} from 'babylonjs';

// Camera interface definition
export interface CameraAngle {
  alpha: number; // horizontal rotation in radians
  beta: number; // vertical rotation in radians
  radius: number; // distance from target
  target?: Vector3; // optional target position
  position?: Vector3; // explicit XYZ position
  dofEnabled?: boolean; // enable/disable depth of field
  focalLength?: number; // camera focal length
  fStop?: number; // aperture f-stop
  focusDistance?: number; // focus distance
  dofBlurLevel?: number; // blur level (low, medium, high)
}

// NOTE: alpha, beta and radius are ignored if position is set
export const cameraAngles: CameraAngle[] = [
  {
    alpha: Math.PI / 3,
    beta: Math.PI / 3,
    radius: 20,
    position: new Vector3(-13, 12, 5),
    target: new Vector3(-1, -2.5, -5),
    dofEnabled: true,
    focalLength: 30,
    fStop: 1.5,
    focusDistance: 50,
    dofBlurLevel: 5,
  },
  // {
  //   alpha: Math.PI / 3,
  //   beta: Math.PI / 3,
  //   radius: 20,
  //   position: new Vector3(5, 15, 6),
  //   target: new Vector3(-1, 2, -1),
  //   dofEnabled: true,
  //   focalLength: 30,
  //   fStop: 1.5,
  //   focusDistance: 50,
  //   dofBlurLevel: 5,
  // },
  // {
  //   alpha: Math.PI / 3,
  //   beta: Math.PI / 3,
  //   radius: 20,
  //   position: new Vector3(12.5, 22.5, 22),
  //   target: new Vector3(-1, -5, 0),
  //   dofEnabled: true,
  //   focalLength: 30,
  //   fStop: 1.5,
  //   focusDistance: 50,
  //   dofBlurLevel: 5,
  // },
  // {
  //   alpha: Math.PI / 3,
  //   beta: Math.PI / 3,
  //   radius: 20,
  //   position: new Vector3(-2, 18.5, 9),
  //   target: new Vector3(5, 5, 0),
  //   dofEnabled: true,
  //   focalLength: 30,
  //   fStop: 1.5,
  //   focusDistance: 50,
  //   dofBlurLevel: 5,
  // },
  // {
  //   alpha: Math.PI / 3,
  //   beta: Math.PI / 3,
  //   radius: 20,
  //   position: new Vector3(33, 21, 11),
  //   target: new Vector3(20, 9, 4),
  //   dofEnabled: true,
  //   focalLength: 30,
  //   fStop: 1.5,
  //   focusDistance: 50,
  //   dofBlurLevel: 5,
  // },
];

export function setupSceneCamera(scene: Scene): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 2, // horizontal rotation
    Math.PI / 2, // vertical rotation
    28, // distance from floor
    new Vector3(0, -0.15, 0),
    scene
  );

  camera.detachControl();

  return camera;
}

export function updateMotionBlur(speed: number, camera: Camera) {
  const motionBlur = camera._postProcesses?.find(
    (pp) => pp instanceof MotionBlurPostProcess
  ) as MotionBlurPostProcess;

  if (motionBlur) {
    const normalizedSpeed = Math.min(Math.max(speed / 10, 0), 1);
    motionBlur.motionStrength = 0.05 + normalizedSpeed * 0.25;
    motionBlur.motionBlurSamples = 5 + Math.floor(normalizedSpeed * 15);
  }
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

export const animateCamera = (
  camera: ArcRotateCamera,
  targetAngle: CameraAngle,
  pipeline: DefaultRenderingPipeline | null,
  duration: number = 3000
) => {
  const scene = camera.getScene();
  const animations = [];

  if (targetAngle.position) {
    // Direct position animation (XYZ coordinates)
    const positionAnimation = new Animation(
      'cameraPositionAnimation',
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    positionAnimation.setKeys([
      { frame: 0, value: camera.position.clone() },
      { frame: 100, value: targetAngle.position },
    ]);

    animations.push({
      animation: positionAnimation,
      target: camera,
    });
  } else {
    // Traditional spherical coordinates animation
    // Create animations for alpha, beta and radius
    const alphaAnimation = new Animation(
      'cameraAlphaAnimation',
      'alpha',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const betaAnimation = new Animation(
      'cameraBetaAnimation',
      'beta',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const radiusAnimation = new Animation(
      'cameraRadiusAnimation',
      'radius',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Create keyframes
    const keyframes = {
      alpha: [
        { frame: 0, value: camera.alpha },
        { frame: 100, value: targetAngle.alpha },
      ],
      beta: [
        { frame: 0, value: camera.beta },
        { frame: 100, value: targetAngle.beta },
      ],
      radius: [
        { frame: 0, value: camera.radius },
        { frame: 100, value: targetAngle.radius },
      ],
    };

    // Set keyframes
    alphaAnimation.setKeys(keyframes.alpha);
    betaAnimation.setKeys(keyframes.beta);
    radiusAnimation.setKeys(keyframes.radius);

    // Add animations to list
    animations.push({
      animation: alphaAnimation,
      target: camera,
    });

    animations.push({
      animation: betaAnimation,
      target: camera,
    });

    animations.push({
      animation: radiusAnimation,
      target: camera,
    });
  }

  // Add target animation if specified
  if (targetAngle.target) {
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
  }

  // Add depth of field animations if specified
  if (pipeline && targetAngle.dofEnabled !== undefined) {
    pipeline.depthOfFieldEnabled = targetAngle.dofEnabled;

    if (targetAngle.dofEnabled) {
      if (targetAngle.focalLength !== undefined) {
        const focalLengthAnimation = new Animation(
          'dofFocalLengthAnimation',
          'depthOfField.focalLength',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        focalLengthAnimation.setKeys([
          { frame: 0, value: pipeline.depthOfField.focalLength },
          { frame: 100, value: targetAngle.focalLength },
        ]);

        animations.push({
          animation: focalLengthAnimation,
          target: pipeline,
        });
      }

      if (targetAngle.fStop !== undefined) {
        const fStopAnimation = new Animation(
          'dofFStopAnimation',
          'depthOfField.fStop',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        fStopAnimation.setKeys([
          { frame: 0, value: pipeline.depthOfField.fStop },
          { frame: 100, value: targetAngle.fStop },
        ]);

        animations.push({
          animation: fStopAnimation,
          target: pipeline,
        });
      }

      if (targetAngle.focusDistance !== undefined) {
        const focusDistanceAnimation = new Animation(
          'dofFocusDistanceAnimation',
          'depthOfField.focusDistance',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        focusDistanceAnimation.setKeys([
          { frame: 0, value: pipeline.depthOfField.focusDistance },
          { frame: 100, value: targetAngle.focusDistance },
        ]);

        animations.push({
          animation: focusDistanceAnimation,
          target: pipeline,
        });
      }

      if (targetAngle.dofBlurLevel !== undefined) {
        pipeline.depthOfFieldBlurLevel = targetAngle.dofBlurLevel;
      }
    }
  }

  // Add easing function for smooth transitions to all animations
  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

  animations.forEach((anim) => {
    anim.animation.setEasingFunction(easingFunction);
  });

  // Start animations
  const animatables = animations.map((anim) => {
    return scene.beginDirectAnimation(
      anim.target,
      [anim.animation],
      0,
      100,
      false,
      (1000 / duration) * 100
    );
  });

  return animatables;
};

export const getRandomCameraAngle = (): CameraAngle => {
  const randomIndex = Math.floor(Math.random() * cameraAngles.length);
  return cameraAngles[randomIndex];
};

export function applyCameraAngle(
  camera: ArcRotateCamera,
  cameraAngle: CameraAngle,
  pipeline: DefaultRenderingPipeline | null
) {
  // Set position
  if (cameraAngle.position) {
    camera.position = cameraAngle.position.clone();
  } else {
    camera.alpha = cameraAngle.alpha;
    camera.beta = cameraAngle.beta;
    camera.radius = cameraAngle.radius;
  }

  // Set target
  if (cameraAngle.target) {
    camera.target = cameraAngle.target.clone();
  }

  // Set depth of field settings
  if (pipeline && cameraAngle.dofEnabled !== undefined) {
    pipeline.depthOfFieldEnabled = cameraAngle.dofEnabled;

    if (cameraAngle.dofEnabled) {
      if (cameraAngle.focalLength !== undefined) {
        pipeline.depthOfField.focalLength = cameraAngle.focalLength;
      }

      if (cameraAngle.fStop !== undefined) {
        pipeline.depthOfField.fStop = cameraAngle.fStop;
      }

      if (cameraAngle.focusDistance !== undefined) {
        pipeline.depthOfField.focusDistance = cameraAngle.focusDistance;
      }

      if (cameraAngle.dofBlurLevel !== undefined) {
        pipeline.depthOfFieldBlurLevel = cameraAngle.dofBlurLevel;
      }
    }
  }
}
