import {
  ArcRotateCamera,
  BlurPostProcess,
  Camera,
  Color3,
  CubeTexture,
  DefaultRenderingPipeline,
  HemisphericLight,
  MirrorTexture,
  Plane,
  SSAO2RenderingPipeline,
  Scene,
  ScreenSpaceReflectionPostProcess,
  ShadowGenerator,
  SpotLight,
  Vector3,
} from 'babylonjs';

export function setupSceneEnvironmentMap(scene: Scene) {
  const envTex = CubeTexture.CreateFromPrefilteredData(
    'https://assets.babylonjs.com/environments/environmentSpecular.env',
    scene
  );
  scene.environmentTexture = envTex;
  scene.environmentIntensity = 0.8;
  scene.imageProcessingConfiguration.contrast = 1.1;
  scene.imageProcessingConfiguration.exposure = 0.8;
  scene.createDefaultSkybox(envTex, true);
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

  // Enable vignette
  pipeline.vignetteEnabled = true;
  if (pipeline.vignette) {
    pipeline.vignette.color = new Color3(0, 0, 0);
    pipeline.vignette.intensity = 2.0;
    pipeline.vignette.stretch = 5;
    pipeline.vignette.weight = 1.5;
  }

  pipeline.fxaaEnabled = true; // Enable anti-aliasing

  // Screen Space Ambient Occlusion
  const ssaoRatio = {
    ssaoRatio: 1.0,
    blurRatio: 0.5,
  };
  const ssao = new SSAO2RenderingPipeline('ssao', scene, ssaoRatio);
  pipeline.imageProcessingEnabled = true;
  pipeline.samples = 4;
  ssao.totalStrength = 2.0;
  ssao.expensiveBlur = true;
  ssao.samples = 16;
  ssao.radius = 5;

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
  hemiLight.intensity = 0.2;

  const leftSpotlight = new SpotLight(
    'leftSpot',
    new Vector3(-10, 10, 10), // Position
    new Vector3(0.2, -0.9, -0.4).normalize(), // Direction
    Math.PI / 3, // Angle
    10, // Exponent
    scene
  );
  leftSpotlight.intensity = 0.7;
  leftSpotlight.diffuse = new Color3(0.9, 0.7, 0.7); // Slightly reddish

  const rightSpotlight = new SpotLight(
    'rightSpot',
    new Vector3(10, 10, 10),
    new Vector3(-0.2, -0.9, -0.4).normalize(),
    Math.PI / 3,
    10,
    scene
  );
  rightSpotlight.intensity = 0.7;
  rightSpotlight.diffuse = new Color3(0.7, 0.7, 0.9); // Slightly bluish

  const shadowGenerator1 = new ShadowGenerator(1024, leftSpotlight);
  const shadowGenerator2 = new ShadowGenerator(1024, rightSpotlight);

  shadowGenerator1.useBlurExponentialShadowMap = true;
  shadowGenerator1.blurKernel = 32;
  shadowGenerator2.useBlurExponentialShadowMap = true;
  shadowGenerator2.blurKernel = 32;

  return {
    lights: [leftSpotlight, rightSpotlight],
    shadowGenerators: [shadowGenerator1, shadowGenerator2],
  };
}

export function setupSceneCamera(scene: Scene) {
  const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 2.01, // horizontal rotation
    Math.PI / 2, // vertical rotation
    24.5, // distance from floor
    new Vector3(-0.15, -0.15, 0),
    scene
  );

  camera.detachControl();

  return camera;
}

export function setupMotionBlur(camera: Camera, strength: number = 1.0) {
  const motionBlur = new BlurPostProcess('motionBlur', new Vector3(0, 0, 1), strength, 1.0, camera);

  return motionBlur;
}

export function setupFloorReflections(scene: Scene, floorMesh: any, reflectingObjects: any[]) {
  const mirrorTexture = new MirrorTexture('floorMirror', 1024, scene, true);
  const floorMaterial = floorMesh.material;

  mirrorTexture.mirrorPlane = new Plane(0, 0, 1, -(floorMesh.position.z + 0.02));

  mirrorTexture.renderList = reflectingObjects;
  mirrorTexture.blurKernel = 0.5;

  floorMaterial.reflectionTexture = mirrorTexture;
  floorMaterial.reflectivityColor.set(0.6, 0.6, 0.6);
  floorMaterial.environmentIntensity = 0.8;

  return mirrorTexture;
}
