import {
  ArcRotateCamera,
  Animation,
  CubicEase,
  DefaultRenderingPipeline,
  EasingFunction,
  Scene,
  Vector3,
} from 'babylonjs';

export interface CameraAngle {
  target: Vector3; // Target position
  position: Vector3; // Explicit position
  dofEnabled: boolean; // enable/disable DOF
  focalLength: number; // Camera focal length
  fStop: number; // Aperture f-stop
  focusDistance: number; // Focus distance
  dofBlurLevel: number; // Blur level
}

export const cameraAngles: CameraAngle[] = [
  {
    // Low player 2 view
    position: new Vector3(-13, 12, 5),
    target: new Vector3(-1, -2.5, -5),
    dofEnabled: true,
    focalLength: 30,
    fStop: 1.5,
    focusDistance: 50,
    dofBlurLevel: 5,
  },
  {
    // Low player 2 view2
    position: new Vector3(-2, 18.5, 9),
    target: new Vector3(5, 5, 0),
    dofEnabled: true,
    focalLength: 30,
    fStop: 1.5,
    focusDistance: 50,
    dofBlurLevel: 5,
  },
  {
    // Low mid board view
    position: new Vector3(5, 15, 6),
    target: new Vector3(-1, -3, -1),
    dofEnabled: true,
    focalLength: 30,
    fStop: 1.5,
    focusDistance: 50,
    dofBlurLevel: 5,
  },
  {
    // High side view (original)
    position: new Vector3(33, 21, 11),
    target: new Vector3(20, 9, 4),
    dofEnabled: true,
    focalLength: 30,
    fStop: 1.5,
    focusDistance: 50,
    dofBlurLevel: 5,
  },
  {
    // Low player 1 view
    position: new Vector3(13, 16, 10),
    target: new Vector3(-20, -10, -15),
    dofEnabled: true,
    focalLength: 30,
    fStop: 1.5,
    focusDistance: 50,
    dofBlurLevel: 5,
  },
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
  duration: number = 3000
) => {
  const scene = camera.getScene();
  const animations = [];

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

export const getRandomCameraAngle = (): CameraAngle => {
  const randomIndex = Math.floor(Math.random() * cameraAngles.length);
  return cameraAngles[randomIndex];
};

export function applyCameraAngle(
  camera: ArcRotateCamera,
  cameraAngle: CameraAngle,
  pipeline: DefaultRenderingPipeline | null
) {
  if (!cameraAngle || !pipeline) return;

  camera.position = cameraAngle.position.clone();
  camera.target = cameraAngle.target.clone();

  if (cameraAngle.dofEnabled === true) {
    pipeline.depthOfFieldEnabled = cameraAngle.dofEnabled;
    pipeline.depthOfFieldEnabled = cameraAngle.dofEnabled;
    pipeline.depthOfField.focalLength = cameraAngle.focalLength;
    pipeline.depthOfField.fStop = cameraAngle.fStop;
    pipeline.depthOfField.focusDistance = cameraAngle.focusDistance;
    pipeline.depthOfFieldBlurLevel = cameraAngle.dofBlurLevel;
  }
}
