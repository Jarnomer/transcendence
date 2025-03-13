import { Animation, Color3, MeshBuilder, PBRMaterial, Scene } from 'babylonjs';

import { createBallTrail } from './babylonParticles';

export function createFloor(scene: Scene, color: Color3) {
  const pbr = new PBRMaterial('floorMaterial', scene);
  const floor = MeshBuilder.CreateBox(
    'floor',
    {
      width: 45,
      height: 0.5,
      depth: 25,
    },
    scene
  );

  // Position the floor
  floor.position.z = 2;
  floor.rotation.x = Math.PI / 2;

  pbr.metallic = 1.0;
  pbr.roughness = 0.05;
  pbr.environmentIntensity = 2.0;

  pbr.albedoColor = color;
  pbr.emissiveColor = new Color3(color.r * 0.07, color.g * 0.07, color.b * 0.07);
  pbr.reflectivityColor = new Color3(1.0, 1.0, 1.0);

  if (scene.environmentTexture) {
    pbr.reflectionTexture = scene.environmentTexture;
  }

  pbr.microSurface = 0.96;
  floor.material = pbr;

  return floor;
}

export function createPaddle(scene: Scene, color: Color3) {
  const pbr = new PBRMaterial('paddlePBRMat', scene);
  const paddle = MeshBuilder.CreateBox(
    'paddle',
    {
      height: 4,
      width: 0.5,
      depth: 0.5,
    },
    scene
  );

  pbr.metallic = 1.0;
  pbr.roughness = 0.1;
  pbr.environmentIntensity = 1.5;

  pbr.albedoColor = color;
  pbr.emissiveColor = new Color3(color.r * 0.8, color.g * 0.8, color.b * 0.8);

  pbr.subSurface.isTranslucencyEnabled = true;
  pbr.subSurface.translucencyIntensity = 0.8;

  if (scene.environmentTexture) {
    pbr.reflectionTexture = scene.environmentTexture;
  }

  paddle.material = pbr;

  // Hover animation
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

  pbr.metallic = 1.0;
  pbr.roughness = 0.05;
  pbr.environmentIntensity = 1.5;

  pbr.albedoColor = color;
  pbr.emissiveColor = new Color3(color.r * 1.0, color.g * 1.0, color.b * 1.0);
  pbr.emissiveIntensity = 1.2;

  pbr.subSurface.isTranslucencyEnabled = true;
  pbr.subSurface.translucencyIntensity = 1.0;

  if (scene.environmentTexture) {
    pbr.reflectionTexture = scene.environmentTexture;
  }

  ball.material = pbr;

  // Hover animation
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

  createBallTrail(scene, ball, color);

  return ball;
}
