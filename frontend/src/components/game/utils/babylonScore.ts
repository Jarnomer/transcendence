import {
  Animation,
  Color4,
  ColorCurves,
  DefaultRenderingPipeline,
  Scene,
  Vector3,
} from 'babylonjs';

export function applyScoreEffects(
  scene: Scene,
  pipeline: DefaultRenderingPipeline,
  scorePosition: Vector3,
  duration: number = 1500
) {
  // Store original values to restore later
  const originalTimeScale = scene.getAnimationRatio;
  const originalBloomScale = pipeline.bloomScale;
  const originalBloomWeight = pipeline.bloomWeight;
  const originalBloomKernel = pipeline.bloomKernel;
  const originalChromaticAmount = pipeline.chromaticAberration.aberrationAmount;
  const wasVignetteEnabled = pipeline.imageProcessing.vignetteEnabled;
  const originalVignetteWeight = pipeline.imageProcessing.vignetteWeight;
  const wasDofEnabled = pipeline.depthOfFieldEnabled;

  const frameRate = 60;

  // Enable and intensify vignette
  pipeline.imageProcessing.vignetteEnabled = true;
  pipeline.imageProcessing.vignetteColor = new Color4(0, 0, 0, 1);
  pipeline.imageProcessing.vignetteWeight = 2.5;

  // Enable and configure depth of field focused on the score position
  pipeline.depthOfFieldEnabled = true;
  pipeline.depthOfField.focalLength = 150; // Increased for stronger effect
  pipeline.depthOfField.fStop = 1.4; // Lower f-stop = more background blur
  pipeline.depthOfField.focusDistance = Vector3.Distance(
    scene.activeCamera!.position,
    scorePosition
  );

  // Increase bloom
  pipeline.bloomScale = 1.0;
  pipeline.bloomWeight = 1.5;
  pipeline.bloomKernel = 128;

  // Increase chromatic aberration
  pipeline.chromaticAberration.aberrationAmount = 30.0;

  // Add color grading - slight desaturation
  pipeline.imageProcessing.colorCurvesEnabled = true;
  const colorCurves = new ColorCurves();
  colorCurves.globalSaturation = 0.5; // Reduce saturation
  colorCurves.globalExposure = 1.2; // Slightly brighter
  pipeline.imageProcessing.colorCurves = colorCurves;

  scene.getAnimationRatio = () => 0.2; // Slow motion

  // Create animations to smoothly restore effects
  const slowmoAnimation = new Animation(
    'timeScaleAnimation',
    'value',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const slowmoKeys = [];
  slowmoKeys.push({ frame: 0, value: 0.2 });
  slowmoKeys.push({ frame: frameRate * (duration / 1000) * 0.5, value: 0.4 });
  slowmoKeys.push({ frame: frameRate * (duration / 1000), value: 1.0 });
  slowmoAnimation.setKeys(slowmoKeys);

  // Create a dummy object to animate and capture values
  const animationTarget = { value: 0.2 };

  scene.beginDirectAnimation(
    animationTarget,
    [slowmoAnimation],
    0,
    frameRate * (duration / 1000),
    false,
    1,
    () => {
      // Reset everything when animation completes
      scene.getAnimationRatio = originalTimeScale;
      pipeline.bloomScale = originalBloomScale;
      pipeline.bloomWeight = originalBloomWeight;
      pipeline.bloomKernel = originalBloomKernel;
      pipeline.chromaticAberration.aberrationAmount = originalChromaticAmount;
      pipeline.imageProcessing.vignetteEnabled = wasVignetteEnabled;
      pipeline.imageProcessing.vignetteWeight = originalVignetteWeight;
      pipeline.depthOfFieldEnabled = wasDofEnabled;
      pipeline.imageProcessing.colorCurvesEnabled = false;
    }
  );

  // Update time scale each frame during the animation
  const observer = scene.onBeforeRenderObservable.add(() => {
    scene.getAnimationRatio = () => animationTarget.value;

    // Gradually reduce effects as we approach the end of the duration
    const progress = 1 - (animationTarget.value - 0.2) / 0.8;
    if (progress < 0) {
      scene.onBeforeRenderObservable.remove(observer);
      return;
    }

    // Gradually reduce bloom
    pipeline.bloomScale = originalBloomScale + (1.0 - originalBloomScale) * progress;
    pipeline.bloomWeight = originalBloomWeight + (1.5 - originalBloomWeight) * progress;

    // Gradually reduce vignette
    pipeline.imageProcessing.vignetteWeight =
      originalVignetteWeight + (2.5 - originalVignetteWeight) * progress;

    // Gradually reduce chromatic aberration
    pipeline.chromaticAberration.aberrationAmount =
      originalChromaticAmount + (30.0 - originalChromaticAmount) * progress;
  });
}

export function applyCollisionFlash(
  pipeline: DefaultRenderingPipeline,
  intensity: number = 0.5,
  duration: number = 200
) {
  // Store original values
  const originalExposure = pipeline.imageProcessing.exposure;

  // Increase exposure for flash effect
  pipeline.imageProcessing.exposure = 1 + intensity;

  // Reset after duration
  setTimeout(() => {
    pipeline.imageProcessing.exposure = originalExposure;
  }, duration);
}
