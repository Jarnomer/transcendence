import {
  ArcRotateCamera,
  BlurPostProcess,
  Camera,
  CubeTexture,
  DefaultRenderingPipeline,
  HemisphericLight,
  SSAO2RenderingPipeline,
  Scene,
  ScreenSpaceReflectionPostProcess,
  Vector3,
} from 'babylonjs';

export function setupSceneEnvironment(scene: Scene) {
  scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
    'https://assets.babylonjs.com/environments/environmentSpecular.env',
    scene
  );
  scene.environmentIntensity = 0.8;
  scene.imageProcessingConfiguration.contrast = 1.1;
  scene.imageProcessingConfiguration.exposure = 0.8;
}

export function setupPostProcessing(scene: Scene, camera: Camera) {
  const pipeline = new DefaultRenderingPipeline('defaultPipeline', true, scene, [camera]);

  // Enable bloom effect
  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.6;
  pipeline.bloomWeight = 0.05;
  pipeline.bloomKernel = 64;
  pipeline.bloomScale = 0.2;

  // Enable chromatic aberration
  pipeline.chromaticAberrationEnabled = true;
  pipeline.chromaticAberration.aberrationAmount = 10.0;
  pipeline.chromaticAberration.radialIntensity = 0.2;

  // Enable grain effect
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 8;
  pipeline.grain.animated = true;

  // Enable anti-aliasing
  pipeline.fxaaEnabled = true;

  // Screen Space Ambient Occlusion
  const ssaoRatio = {
    ssaoRatio: 1.0,
    blurRatio: 0.5,
  };
  const ssao = new SSAO2RenderingPipeline('ssao', scene, ssaoRatio);
  pipeline.samples = 4;
  pipeline.imageProcessingEnabled = true;
  ssao.radius = 2;
  ssao.totalStrength = 1.0;
  ssao.expensiveBlur = true;
  ssao.samples = 16;

  scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline('ssao', camera);

  // Screen Space Reflections
  const ssr = new ScreenSpaceReflectionPostProcess('ssr', scene, 1.0, camera);
  ssr.threshold = 0.5;
  ssr.strength = 1.0;
  ssr.reflectionSpecularFalloffExponent = 3;
  ssr.samples = 32;
  ssr.maxDistance = 1000;
  ssr.step = 0.1;
  ssr.thickness = 0.5;

  return pipeline;
}

export function setupScenelights(scene: Scene) {
  const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.7;
}

export function setupSceneCamera(scene: Scene) {
  const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 2.01, // horizontal rotation
    Math.PI / 2, // vertical rotation
    24.5, // distance from floor
    new Vector3(0, 0, 0),
    scene
  );

  camera.detachControl();

  return camera;
}

export function setupMotionBlur(camera: Camera, strength: number = 1.0) {
  const motionBlur = new BlurPostProcess('motionBlur', new Vector3(0, 0, 1), strength, 1.0, camera);

  return motionBlur;
}
