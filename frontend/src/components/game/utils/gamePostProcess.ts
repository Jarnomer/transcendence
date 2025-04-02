import {
  Camera,
  Color3,
  CubeTexture,
  DefaultRenderingPipeline,
  DynamicTexture,
  HemisphericLight,
  MirrorTexture,
  MotionBlurPostProcess,
  Plane,
  SSAO2RenderingPipeline,
  Scene,
  ShadowGenerator,
  SpotLight,
  Texture,
  Vector3,
} from 'babylonjs';

export function setupEnvironmentMap(scene: Scene) {
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

export function setupPostProcessing(scene: Scene, camera: Camera, enableDOF: boolean = false) {
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
  pipeline.grain.intensity = 24;
  pipeline.grain.animated = true;

  pipeline.fxaaEnabled = true; // Enable anti-aliasing

  // Enable depth of field if requested
  if (enableDOF) {
    pipeline.depthOfFieldEnabled = true;
    pipeline.depthOfField.focalLength = 50;
    pipeline.depthOfField.fStop = 1.4;
    pipeline.depthOfField.focusDistance = 50;
    pipeline.depthOfFieldBlurLevel = 2;
  }

  // Enable motion blur
  const motionBlur = new MotionBlurPostProcess('motionBlur', scene, 1.0, camera);
  motionBlur.motionStrength = 0.1;
  motionBlur.motionBlurSamples = 15;

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
  ssao.radius = 8;

  scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline('ssao', camera);

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
  leftSpotlight.diffuse = new Color3(0.7, 0.7, 0.7);

  const rightSpotlight = new SpotLight(
    'rightSpot',
    new Vector3(10, 10, 10),
    new Vector3(-0.2, -0.9, -0.4).normalize(),
    Math.PI / 3,
    10,
    scene
  );
  rightSpotlight.intensity = 0.7;
  rightSpotlight.diffuse = new Color3(0.7, 0.7, 0.7);

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

export function setupReflections(scene: Scene, floorMesh: any, reflectingObjects: any[]) {
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

export function createParticleTexture(scene: Scene, color: Color3): Texture {
  const textureSize = 64;
  const texture = new DynamicTexture('particleTexture', textureSize, scene, false);
  const context = texture.getContext();

  // Create a radial gradient
  const gradient = context.createRadialGradient(
    textureSize / 2,
    textureSize / 2,
    0,
    textureSize / 2,
    textureSize / 2,
    textureSize / 2
  );

  // Convert Color3 to CSS color strings
  const rgbColor = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
  const rgbaColorTransparent = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0)`;

  // Color stops - Center, "middle" and edge
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(0.3, rgbColor);
  gradient.addColorStop(1, rgbaColorTransparent);

  context.fillStyle = gradient;
  context.fillRect(0, 0, textureSize, textureSize);

  texture.update();

  return texture;
}
