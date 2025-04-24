import {
  Camera,
  Color3,
  CubeTexture,
  DefaultRenderingPipeline,
  DirectionalLight,
  HemisphericLight,
  Mesh,
  MirrorTexture,
  Plane,
  Scene,
  SSAORenderingPipeline,
  BlurPostProcess,
  ShadowGenerator,
  Texture,
  Vector2,
  Vector3,
} from 'babylonjs';

function createCubeTexture(rootUrl: string, scene: Scene) {
  const envTexture = new CubeTexture(rootUrl, scene);

  envTexture.onLoadObservable.add(() => {
    envTexture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
  });

  return envTexture;
}

export function setupEnvironmentMap(scene: Scene) {
  const envTex = createCubeTexture(
    'https://assets.babylonjs.com/environments/environmentSpecular.env',
    scene
  );
  scene.environmentTexture = envTex;
  scene.environmentIntensity = 0.8;
  scene.imageProcessingConfiguration.contrast = 1.1;
  scene.imageProcessingConfiguration.exposure = 0.8;
  scene.createDefaultSkybox(envTex, true);

  scene.useDelayedTextureLoading = true;
  scene.autoClearDepthAndStencil = true;
  scene.autoClear = true;

  scene.executeWhenReady(() => {
    scene.render();
  });
}

export function setupPostProcessing(scene: Scene, camera: Camera, isGameplay: boolean = true) {
  const pipeline = new DefaultRenderingPipeline('defaultPipeline', true, scene, [camera]);

  pipeline.fxaaEnabled = true;

  if (isGameplay) {
    pipeline.samples = 4;

    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 1.0;
    pipeline.bloomWeight = 0.1;
    pipeline.bloomKernel = 64;
    pipeline.bloomScale = 2.0;

    pipeline.chromaticAberrationEnabled = true;
    pipeline.chromaticAberration.aberrationAmount = 10;
    pipeline.chromaticAberration.radialIntensity = 0.2;

    pipeline.grainEnabled = true;
    pipeline.grain.intensity = 10;
    pipeline.grain.animated = true;

    pipeline.sharpenEnabled = true;
    pipeline.sharpen.edgeAmount = 0.3;
    pipeline.sharpen.colorAmount = 1.0;
  } else {
    pipeline.samples = 1;

    pipeline.bloomEnabled = true;
    pipeline.bloomThreshold = 1.2;
    pipeline.bloomWeight = 0.05;
    pipeline.bloomKernel = 32;
    pipeline.bloomScale = 1.0;

    pipeline.chromaticAberrationEnabled = true;
    pipeline.chromaticAberration.aberrationAmount = 15;
    pipeline.chromaticAberration.radialIntensity = 0.2;

    pipeline.grainEnabled = true;
    pipeline.grain.intensity = 10;
    pipeline.grain.animated = true;

    pipeline.depthOfFieldEnabled = true;
    pipeline.depthOfField.focalLength = 50;
    pipeline.depthOfField.fStop = 3.0;
    pipeline.depthOfField.focusDistance = 50;
    pipeline.depthOfFieldBlurLevel = 1.0;
  }

  return pipeline;
}

export function setupSSAO(scene: Scene, camera: Camera) {
  const ssaoPipeline = new SSAORenderingPipeline(
    'ssao',
    scene,
    {
      ssaoRatio: 0.5,
      combineRatio: 1.0,
    },
    [camera]
  );

  ssaoPipeline.radius = 2.0;
  ssaoPipeline.totalStrength = 1.0;
  ssaoPipeline.area = 0.15;
  ssaoPipeline.fallOff = 0.000001;
  ssaoPipeline.base = 0.5;

  return ssaoPipeline;
}

export function setupBlurEffect(camera: Camera) {
  const effectiveBlurSize = 2;

  const horizontalBlur = new BlurPostProcess(
    'horizontalBlur',
    new Vector2(1.0, 0),
    effectiveBlurSize,
    1.0,
    camera
  );

  const verticalBlur = new BlurPostProcess(
    'verticalBlur',
    new Vector2(0, 1.0),
    effectiveBlurSize,
    1.0,
    camera
  );

  return {
    horizontalBlur,
    verticalBlur,
  };
}

export function setupScenelights(scene: Scene, primaryColor: Color3) {
  const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
  hemiLight.intensity = 0.3;

  const leftDirectionalLight = new DirectionalLight(
    'leftDirectionalLight',
    new Vector3(1, -0.5, -0.5),
    scene
  );
  leftDirectionalLight.intensity = 6;
  leftDirectionalLight.diffuse = primaryColor;
  leftDirectionalLight.specular = primaryColor;

  const rightDirectionalLight = new DirectionalLight(
    'rightDirectionalLight',
    new Vector3(-1, -0.5, -0.5),
    scene
  );
  rightDirectionalLight.intensity = 6;
  rightDirectionalLight.diffuse = primaryColor;
  rightDirectionalLight.specular = primaryColor;

  const leftShadowGenerator = new ShadowGenerator(1024, leftDirectionalLight);
  leftShadowGenerator.useBlurExponentialShadowMap = true;
  leftShadowGenerator.blurKernel = 32;

  const rightShadowGenerator = new ShadowGenerator(1024, rightDirectionalLight);
  rightShadowGenerator.useBlurExponentialShadowMap = true;
  rightShadowGenerator.blurKernel = 32;

  return {
    lights: [leftDirectionalLight, rightDirectionalLight],
    shadowGenerators: [leftShadowGenerator, rightShadowGenerator],
  };
}

export function setupReflections(scene: Scene, floorMesh: any, reflectingObjects: Mesh[]) {
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
