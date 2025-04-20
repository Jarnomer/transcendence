import {
  Camera,
  Color3,
  CubeTexture,
  DefaultRenderingPipeline,
  DynamicTexture,
  HemisphericLight,
  MirrorTexture,
  Plane,
  Scene,
  ShadowGenerator,
  DirectionalLight,
  Texture,
  Vector3,
} from 'babylonjs';

import { CameraDOFSettings, defaultCameraDOFSettings } from '@game/utils';

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

export function setupPostProcessing(scene: Scene, camera: Camera) {
  const pipeline = new DefaultRenderingPipeline('defaultPipeline', true, scene, [camera]);
  const dofSettings: CameraDOFSettings = defaultCameraDOFSettings;

  pipeline.bloomThreshold = 0.6;
  pipeline.bloomWeight = 0.05;
  pipeline.bloomKernel = 64;
  pipeline.bloomScale = 0.2;

  pipeline.chromaticAberrationEnabled = true;
  pipeline.chromaticAberration.aberrationAmount = 10;
  pipeline.chromaticAberration.radialIntensity = 0.2;

  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 8;
  pipeline.grain.animated = true;

  pipeline.fxaaEnabled = true;

  pipeline.depthOfFieldEnabled = false;
  pipeline.depthOfField.focalLength = dofSettings.focalLength;
  pipeline.depthOfField.fStop = dofSettings.fStop;
  pipeline.depthOfField.focusDistance = dofSettings.focusDistance;
  pipeline.depthOfFieldBlurLevel = dofSettings.dofBlurLevel;

  return pipeline;
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
