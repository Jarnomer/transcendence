import {
  Vector3,
  Animation,
  Color3,
  GlowLayer,
  MeshBuilder,
  PBRMaterial,
  Scene,
  Path3D,
} from 'babylonjs';

import { createSafeTexture } from '@game/utils';

import { GameObjectParams, defaultGameObjectParams } from '@shared/types';

export function createEdge(
  scene: Scene,
  color: Color3,
  params: GameObjectParams = defaultGameObjectParams
) {
  const width = params.edge.width;
  const numPoints = params.edge.numPoints;
  const points: Vector3[] = [];

  // Create straight path initially
  for (let i = 0; i < numPoints; i++) {
    const x = (i / (numPoints - 1)) * width - width / 2;
    points.push(new Vector3(x, 0, 0));
  }

  const pbr = new PBRMaterial('edgeMaterial', scene);
  const path3d = new Path3D(points);
  const tube = MeshBuilder.CreateTube(
    'edge',
    {
      path: points,
      radius: params.edge.radius,
      tessellation: params.edge.tessellation,
      updatable: true,
    },
    scene
  );

  pbr.albedoColor = color;
  pbr.emissiveColor = new Color3(
    color.r * params.edge.emissiveColorMultiplier,
    color.g * params.edge.emissiveColorMultiplier,
    color.b * params.edge.emissiveColorMultiplier
  );
  pbr.emissiveIntensity = params.edge.emissiveIntensity;
  pbr.environmentIntensity = params.edge.environmentIntensity;

  pbr.metallic = params.edge.materialMetallic;
  pbr.roughness = params.edge.materialRoughness;

  pbr.subSurface.isRefractionEnabled = true;
  pbr.subSurface.refractionIntensity = params.edge.refractionIntensity;
  pbr.subSurface.indexOfRefraction = params.edge.indexOfRefraction;
  pbr.subSurface.isTranslucencyEnabled = true;
  pbr.subSurface.translucencyIntensity = params.edge.translucencyIntensity;

  if (scene.environmentTexture) pbr.reflectionTexture = scene.environmentTexture;

  tube.material = pbr;

  const glowLayer = new GlowLayer(`edgeGlowLayer`, scene);
  glowLayer.intensity = params.edge.glowLayerIntensity;
  glowLayer.blurKernelSize = params.edge.glowLayerBlurKernelSize;
  glowLayer.addIncludedOnlyMesh(tube);

  const frameRate = 30;
  const hoverAnimation = new Animation(
    `edgeHoverAnimation`,
    'position.z',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const keys = [];
  keys.push({ frame: 0, value: params.edge.animation.bottomValue });
  keys.push({ frame: frameRate, value: params.edge.animation.topValue });
  keys.push({ frame: frameRate * 2, value: params.edge.animation.bottomValue });

  hoverAnimation.setKeys(keys);
  tube.animations = [hoverAnimation];
  scene.beginAnimation(tube, 0, frameRate * 2, true);

  // Save the original points for deformation
  tube.metadata = {
    originalPoints: [...points],
    path3d: path3d,
    points: points,
  };

  return tube;
}

export function createFloor(
  scene: Scene,
  color: Color3,
  params: GameObjectParams = defaultGameObjectParams
) {
  const pbr = new PBRMaterial('floorMaterial', scene);
  const floor = MeshBuilder.CreateBox(
    'floor',
    {
      width: params.floor.width,
      depth: params.floor.depth,
    },
    scene
  );

  // Position and rotate the floor
  floor.position.z = params.floor.positionZ;
  floor.rotation.x = Math.PI / 2;

  const baseUrl = '/floor-metal/';

  const texturesLoaded = { count: 0, total: 4 };
  const checkAllLoaded = () => {
    texturesLoaded.count++;
    if (texturesLoaded.count === texturesLoaded.total) {
      floor.material = pbr;
    }
  };

  pbr.albedoTexture = createSafeTexture(baseUrl + 'albedo.png', scene, checkAllLoaded);
  pbr.bumpTexture = createSafeTexture(baseUrl + 'normal.png', scene, checkAllLoaded);
  pbr.metallicTexture = createSafeTexture(baseUrl + 'metallic.png', scene, checkAllLoaded);
  pbr.ambientTexture = createSafeTexture(baseUrl + 'ao.png', scene, checkAllLoaded);

  const multipleColor = params.floor.colorMultiplier;
  const adjustedColor = new Color3(
    Math.max(multipleColor, color.r),
    Math.max(multipleColor, color.g),
    Math.max(multipleColor, color.b)
  );
  pbr.albedoColor = adjustedColor;

  pbr.emissiveColor = new Color3(
    color.r * params.floor.emissiveColorMultiplier,
    color.g * params.floor.emissiveColorMultiplier,
    color.b * params.floor.emissiveColorMultiplier
  );

  pbr.reflectivityColor = new Color3(
    params.floor.reflectivityColor.r,
    params.floor.reflectivityColor.g,
    params.floor.reflectivityColor.b
  );

  pbr.metallic = params.floor.metallic;
  pbr.roughness = params.floor.roughness;
  pbr.microSurface = params.floor.microSurface;
  pbr.environmentIntensity = params.floor.environmentIntensity;

  pbr.useParallax = true;
  pbr.useParallaxOcclusion = true;
  pbr.parallaxScaleBias = params.floor.parallaxScaleBias;
  pbr.ambientTextureStrength = params.floor.ambientTextureStrength;

  pbr.clearCoat.isEnabled = true;
  pbr.clearCoat.intensity = params.floor.clearCoat.intensity;
  pbr.clearCoat.roughness = params.floor.clearCoat.roughness;

  pbr.albedoTexture.anisotropicFilteringLevel = params.floor.textureAnisotropicLevel;
  pbr.bumpTexture.anisotropicFilteringLevel = params.floor.textureAnisotropicLevel;

  if (scene.environmentTexture) pbr.reflectionTexture = scene.environmentTexture;

  floor.receiveShadows = true;
  floor.material = pbr;

  return floor;
}

export function createPaddle(
  scene: Scene,
  color: Color3,
  params: GameObjectParams = defaultGameObjectParams
) {
  const pbr = new PBRMaterial('paddleMaterial', scene);
  const paddle = MeshBuilder.CreateBox(
    'paddle',
    {
      height: params.paddle.height,
      width: params.paddle.width,
      depth: params.paddle.depth,
    },
    scene
  );

  pbr.albedoColor = color;
  pbr.emissiveColor = new Color3(
    color.r * params.paddle.emissiveColorMultiplier,
    color.g * params.paddle.emissiveColorMultiplier,
    color.b * params.paddle.emissiveColorMultiplier
  );
  pbr.emissiveIntensity = params.paddle.emissiveIntensity;
  pbr.environmentIntensity = params.paddle.environmentIntensity;

  pbr.metallic = params.paddle.materialMetallic;
  pbr.roughness = params.paddle.materialRoughness;

  pbr.subSurface.isRefractionEnabled = true;
  pbr.subSurface.isTranslucencyEnabled = true;
  pbr.useSpecularOverAlpha = true;

  pbr.subSurface.refractionIntensity = params.paddle.refractionIntensity;
  pbr.subSurface.indexOfRefraction = params.paddle.indexOfRefraction;
  pbr.subSurface.translucencyIntensity = params.ball.translucencyIntensity;

  if (scene.environmentTexture) pbr.reflectionTexture = scene.environmentTexture;

  paddle.material = pbr;

  const glowLayer = new GlowLayer('paddleGlowLayer', scene);
  glowLayer.intensity = params.paddle.glowLayerIntensity;
  glowLayer.blurKernelSize = params.paddle.glowLayerBlurKernelSize;
  glowLayer.addIncludedOnlyMesh(paddle);

  const frameRate = 30;
  const hoverAnimation = new Animation(
    'paddleHoverAnimation',
    'position.z',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const keys = [];
  keys.push({ frame: 0, value: params.paddle.animation.bottomValue });
  keys.push({ frame: frameRate, value: params.paddle.animation.topValue });
  keys.push({ frame: frameRate * 2, value: params.paddle.animation.bottomValue });

  hoverAnimation.setKeys(keys);
  paddle.animations = [hoverAnimation];
  scene.beginAnimation(paddle, 0, frameRate * 2, true);

  return paddle;
}

export function createBall(
  scene: Scene,
  color: Color3,
  params: GameObjectParams = defaultGameObjectParams
) {
  const pbr = new PBRMaterial('ballMaterial', scene);
  const ball = MeshBuilder.CreateSphere(
    'ball',
    {
      diameter: params.ball.diameter,
      segments: params.ball.segments,
    },
    scene
  );

  pbr.albedoColor = color;
  pbr.emissiveColor = new Color3(
    color.r * params.ball.emissiveColorMultiplier,
    color.g * params.ball.emissiveColorMultiplier,
    color.b * params.ball.emissiveColorMultiplier
  );

  pbr.emissiveIntensity = params.ball.emissiveIntensity;
  pbr.environmentIntensity = params.ball.environmentIntensity;

  pbr.metallic = params.ball.materialMetallic;
  pbr.roughness = params.ball.materialRoughness;

  pbr.subSurface.isRefractionEnabled = true;
  pbr.subSurface.isTranslucencyEnabled = true;
  pbr.useSpecularOverAlpha = true;

  pbr.subSurface.refractionIntensity = params.ball.refractionIntensity;
  pbr.subSurface.indexOfRefraction = params.ball.indexOfRefraction;
  pbr.subSurface.translucencyIntensity = params.ball.translucencyIntensity;

  if (scene.environmentTexture) pbr.reflectionTexture = scene.environmentTexture;

  ball.material = pbr;

  const glowLayer = new GlowLayer('ballGlowLayer', scene);
  glowLayer.intensity = params.ball.glowLayerIntensity;
  glowLayer.blurKernelSize = params.ball.glowLayerBlurKernelSize;
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

  keys.push({ frame: 0, value: params.ball.animation.bottomValue });
  keys.push({ frame: frameRate, value: params.ball.animation.topValue });
  keys.push({ frame: frameRate * 2, value: params.ball.animation.bottomValue });

  hoverAnimation.setKeys(keys);

  ball.animations = [hoverAnimation];

  scene.beginAnimation(ball, 0, frameRate * 2, true);

  return ball;
}
