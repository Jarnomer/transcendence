import { Animation, Color3, GlowLayer, MeshBuilder, PBRMaterial, Scene, Texture } from 'babylonjs';

export function createFloor(scene: Scene, color: Color3) {
  const pbr = new PBRMaterial('floorMaterial', scene);
  const floor = MeshBuilder.CreateBox(
    'floor',
    {
      width: 60,
      depth: 30,
    },
    scene
  );

  // Position and rotate the floor
  floor.position.z = 1.2;
  floor.rotation.x = Math.PI / 2;

  const baseUrl = '/floor-metal/';
  pbr.albedoTexture = new Texture(baseUrl + 'albedo.png', scene);
  pbr.bumpTexture = new Texture(baseUrl + 'normal.png', scene);
  pbr.metallicTexture = new Texture(baseUrl + 'metallic.png', scene);
  pbr.ambientTexture = new Texture(baseUrl + 'ao.png', scene);

  const multipleColor = 0.2;
  const adjustedColor = new Color3(
    Math.max(multipleColor, color.r),
    Math.max(multipleColor, color.g),
    Math.max(multipleColor, color.b)
  );
  pbr.albedoColor = adjustedColor;

  pbr.emissiveColor = new Color3(color.r * 0.1, color.g * 0.1, color.b * 0.1);
  pbr.reflectivityColor = new Color3(0.8, 0.8, 0.8);

  pbr.metallic = 0.8;
  pbr.roughness = 0.2;
  pbr.microSurface = 0.9;
  pbr.environmentIntensity = 1.5;

  pbr.useParallax = true;
  pbr.useParallaxOcclusion = true;
  pbr.parallaxScaleBias = 0.3;
  pbr.ambientTextureStrength = 3.0;

  pbr.clearCoat.isEnabled = true;
  pbr.clearCoat.intensity = 0.5;
  pbr.clearCoat.roughness = 0.1;

  pbr.albedoTexture.anisotropicFilteringLevel = 16;
  pbr.bumpTexture.anisotropicFilteringLevel = 16;

  if (scene.environmentTexture) pbr.reflectionTexture = scene.environmentTexture;

  floor.receiveShadows = true;
  floor.material = pbr;

  return floor;
}

export function createPaddle(scene: Scene, color: Color3) {
  const pbr = new PBRMaterial('ballMaterial', scene);
  const paddle = MeshBuilder.CreateBox(
    'paddle',
    {
      height: 4.0,
      width: 0.5,
      depth: 0.7,
    },
    scene
  );

  pbr.albedoColor = color;
  pbr.emissiveColor = new Color3(color.r * 0.8, color.g * 0.8, color.b * 0.8);
  pbr.emissiveIntensity = 1.0;

  pbr.metallic = 0.6;
  pbr.roughness = 0.2;
  pbr.environmentIntensity = 0.8;
  pbr.subSurface.isRefractionEnabled = true;
  pbr.subSurface.refractionIntensity = 0.5;
  pbr.subSurface.indexOfRefraction = 1.5;
  pbr.subSurface.isTranslucencyEnabled = true;
  pbr.subSurface.translucencyIntensity = 1.0;
  pbr.useSpecularOverAlpha = true;

  if (scene.environmentTexture) pbr.reflectionTexture = scene.environmentTexture;

  paddle.material = pbr;

  const glowLayer = new GlowLayer('glowLayer', scene);
  glowLayer.intensity = 0.2;
  glowLayer.blurKernelSize = 32;
  glowLayer.addIncludedOnlyMesh(paddle);

  const frameRate = 30;
  const hoverAnimation = new Animation(
    'hoverAnimation',
    'position.z',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const keys = [];
  keys.push({ frame: 0, value: 0.1 });
  keys.push({ frame: frameRate, value: 0.3 });
  keys.push({ frame: frameRate * 2, value: 0.1 });

  hoverAnimation.setKeys(keys);
  paddle.animations = [hoverAnimation];
  scene.beginAnimation(paddle, 0, frameRate * 2, true);

  return paddle;
}

export function createBall(scene: Scene, color: Color3, diameter: number = 0.8) {
  const pbr = new PBRMaterial('ballMaterial', scene);
  const ball = MeshBuilder.CreateSphere(
    'ball',
    {
      diameter: diameter,
      segments: 32,
    },
    scene
  );

  pbr.albedoColor = color;
  pbr.emissiveColor = new Color3(color.r * 1.2, color.g * 1.2, color.b * 1.2);
  pbr.emissiveIntensity = 2.0;

  pbr.metallic = 0.1;
  pbr.roughness = 1.0;
  pbr.environmentIntensity = 1.2;
  pbr.subSurface.isRefractionEnabled = true;
  pbr.subSurface.refractionIntensity = 0.5;
  pbr.subSurface.indexOfRefraction = 1.5;
  pbr.subSurface.isTranslucencyEnabled = true;
  pbr.subSurface.translucencyIntensity = 1.0;
  pbr.useSpecularOverAlpha = true;

  if (scene.environmentTexture) pbr.reflectionTexture = scene.environmentTexture;

  ball.material = pbr;

  const glowLayer = new GlowLayer('glowLayer', scene);
  glowLayer.intensity = 0.3;
  glowLayer.blurKernelSize = 64;
  glowLayer.addIncludedOnlyMesh(ball);

  const frameRate = 30;
  const hoverAnimation = new Animation(
    'ballHoverAnimation',
    'position.z',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const keys = [];
  keys.push({ frame: 0, value: 0.2 });
  keys.push({ frame: frameRate, value: 0.5 });
  keys.push({ frame: frameRate * 2, value: 0.2 });

  hoverAnimation.setKeys(keys);
  ball.animations = [hoverAnimation];
  scene.beginAnimation(ball, 0, frameRate * 2, true);

  return ball;
}
