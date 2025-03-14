import {
  ArcRotateCamera,
  Camera,
  CubeTexture,
  DefaultRenderingPipeline,
  HemisphericLight,
  Scene,
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

  // // Enable chromatic aberration
  pipeline.chromaticAberrationEnabled = true;
  pipeline.chromaticAberration.aberrationAmount = 10.0;
  pipeline.chromaticAberration.radialIntensity = 0.2;

  // Enable grain effect
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 8;
  pipeline.grain.animated = true;

  // // Enable anti-aliasing
  pipeline.fxaaEnabled = true;

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
