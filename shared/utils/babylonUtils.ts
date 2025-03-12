import {
  Animation,
  Color3,
  Color4,
  DynamicTexture,
  MeshBuilder,
  PBRMaterial,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from 'babylonjs';

import { parseColor } from './colorConvertor';

export interface ThemeColors {
  primaryColor: Color3;
  secondaryColor: Color3;
  backgroundColor: Color3;
}

export function getThemeColors(
  theme: 'light' | 'dark' = 'dark',
  primaryColorHex?: string,
  secondaryColorHex?: string,
  backgroundColorHex?: string
): ThemeColors {
  const primaryColor = parseColor(primaryColorHex || '#ea355a');
  const secondaryColor = parseColor(secondaryColorHex || 'oklch(8% 0% 0)');
  const backgroundColor = parseColor(backgroundColorHex || 'black');

  return {
    primaryColor,
    secondaryColor,
    backgroundColor,
  };
}

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

function createParticleTexture(scene: Scene, color: Color3): Texture {
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

  gradient.addColorStop(0, 'white'); // Bright center
  gradient.addColorStop(0.3, rgbColor); // Color matching the theme
  gradient.addColorStop(1, rgbaColorTransparent); // Transparent edge

  // Fill the canvas with the gradient
  context.fillStyle = gradient;
  context.fillRect(0, 0, textureSize, textureSize);

  texture.update();

  return texture;
}

export function createBallTrail(scene: Scene, ballMesh: any, color: Color3) {
  const particleSystem = new ParticleSystem('ballTrail', 500, scene);

  // Create a slightly bluer version for the "dead" color
  const deadColorR = Math.max(0, color.r * 0.7);
  const deadColorG = Math.max(0, color.g * 0.7);
  const deadColorB = Math.min(1, color.b * 1.3);

  particleSystem.particleTexture = createParticleTexture(scene, color);
  particleSystem.emitter = ballMesh;

  particleSystem.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
  particleSystem.maxEmitBox = new Vector3(0.1, 0.1, 0.1);

  particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
  particleSystem.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 1.0);
  particleSystem.colorDead = new Color4(deadColorR, deadColorG, deadColorB, 0);

  // Size, lifetime, emission rate and speed
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  particleSystem.minLifeTime = 0.1;
  particleSystem.maxLifeTime = 0.5;
  particleSystem.emitRate = 100;
  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 3;

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  // Set slightly negative to make particles float upward
  particleSystem.gravity = new Vector3(0, -0.1, 0);

  // Direction - will be updated based on ball velocity
  particleSystem.direction1 = new Vector3(-1, 0, 0);
  particleSystem.direction2 = new Vector3(-1, 0, 0);

  particleSystem.start();

  ballMesh.trailParticleSystem = particleSystem;

  return particleSystem;
}

export function updateBallTrail(ballMesh: any, dx: number, dy: number) {
  if (!ballMesh || !ballMesh.trailParticleSystem) return;

  const ps = ballMesh.trailParticleSystem;
  const speed = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vectors to opposite of ball movement
  const normalizedDx = dx !== 0 ? -dx / Math.abs(dx) : 0;
  const normalizedDy = dy !== 0 ? -dy / Math.abs(dy) : 0;

  // Set direction based on ball velocity opposite to movement
  ps.direction1 = new Vector3(normalizedDx, normalizedDy, 0);
  ps.direction2 = new Vector3(normalizedDx * 0.8, normalizedDy * 0.8, 0);

  // Scale emission rate and power with speed
  ps.emitRate = 50 + speed * 20;
  ps.minEmitPower = 0.5 + speed * 0.5;
  ps.maxEmitPower = 1.5 + speed * 1.0;

  // Scale particle lifetime and size with speed
  ps.minLifeTime = 0.1 + speed * 0.05;
  ps.maxLifeTime = 0.3 + speed * 0.1;
  ps.minSize = 0.1 + speed * 0.03;
  ps.maxSize = 0.3 + speed * 0.1;
}

// Update the ball trail's color when theme changes
export function updateBallTrailColor(ballMesh: any, color: Color3, scene: Scene) {
  if (!ballMesh || !ballMesh.trailParticleSystem) return;

  // Create a slightly bluer version for the "dead" color
  const deadColorR = Math.max(0, color.r * 0.7);
  const deadColorG = Math.max(0, color.g * 0.7);
  const deadColorB = Math.min(1, color.b * 1.3);
  const ps = ballMesh.trailParticleSystem;

  ps.particleTexture.dispose();
  ps.particleTexture = createParticleTexture(scene, color);

  ps.color1 = new Color4(color.r, color.g, color.b, 1.0);
  ps.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 1.0);
  ps.colorDead = new Color4(deadColorR, deadColorG, deadColorB, 0);

  ballMesh.ballColor = color;
}
