import {
  Color3,
  Color4,
  DefaultRenderingPipeline,
  DynamicTexture,
  Engine,
  ParticleSystem,
  Vector3,
  GlowLayer,
  Mesh,
  Scene,
  ShadowGenerator,
  Texture,
} from 'babylonjs';

import { getThemeColors } from '@game/utils';

import { PowerUpType, defaultGameParams } from '@shared/types';

export function createParticleTexture(scene: Scene, color: Color3): Texture {
  const textureSize = 64;
  const texture = new DynamicTexture('particleTexture', textureSize, scene, false);
  const context = texture.getContext();

  const gradient = context.createRadialGradient(
    textureSize / 2,
    textureSize / 2,
    0,
    textureSize / 2,
    textureSize / 2,
    textureSize / 2
  );

  const rgbColor = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
  const rgbaColorTransparent = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0)`;

  gradient.addColorStop(0, 'white');
  gradient.addColorStop(0.3, rgbColor);
  gradient.addColorStop(1, rgbaColorTransparent);

  context.fillStyle = gradient;
  context.fillRect(0, 0, textureSize, textureSize);

  texture.update();

  return texture;
}

export function createStandardParticleSystem(
  name: string,
  scene: Scene,
  emitter: Vector3 | Mesh,
  options: {
    color: Color3;
    capacity?: number;
    emitRate?: number;
    minSize?: number;
    maxSize?: number;
    minLifeTime?: number;
    maxLifeTime?: number;
    minEmitPower?: number;
    maxEmitPower?: number;
    blendMode?: number;
  },
  texturePath?: string
): ParticleSystem {
  const {
    color,
    capacity = 100,
    emitRate = 50,
    minSize = 0.1,
    maxSize = 0.5,
    minLifeTime = 0.3,
    maxLifeTime = 1.5,
    minEmitPower = 1.0,
    maxEmitPower = 2.0,
    blendMode = ParticleSystem.BLENDMODE_ADD,
  } = options;

  const particleSystem = new ParticleSystem(name, capacity, scene);

  if (texturePath) {
    particleSystem.particleTexture = new Texture(texturePath, scene);
  } else {
    particleSystem.particleTexture = createParticleTexture(scene, color);
  }

  particleSystem.emitter = emitter;
  particleSystem.emitRate = emitRate;
  particleSystem.minSize = minSize;
  particleSystem.maxSize = maxSize;
  particleSystem.minLifeTime = minLifeTime;
  particleSystem.maxLifeTime = maxLifeTime;
  particleSystem.minEmitPower = minEmitPower;
  particleSystem.maxEmitPower = maxEmitPower;
  particleSystem.blendMode = blendMode;

  particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
  particleSystem.color2 = new Color4(color.r * 1.5, color.g * 1.5, color.b * 1.5, 0.8);
  particleSystem.colorDead = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0);

  return particleSystem;
}

export function addGlowEffect(
  name: string,
  mesh: Mesh,
  scene: Scene,
  intensity: number = 0.5,
  blurKernelSize: number = 32
): GlowLayer {
  const glowLayer = new GlowLayer(name, scene);
  glowLayer.intensity = intensity;
  glowLayer.blurKernelSize = blurKernelSize;
  glowLayer.addIncludedOnlyMesh(mesh);

  if (!mesh.metadata) mesh.metadata = {};
  if (!mesh.metadata.glowLayers) mesh.metadata.glowLayers = [];
  mesh.metadata.glowLayers.push(glowLayer);

  return glowLayer;
}

export function gameToSceneX(gameX: number, mesh: Mesh): number {
  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const scaleFactor = defaultGameParams.dimensions.scaleFactor;
  const canvasX = (gameX - gameWidth / 2) / scaleFactor;

  const boundingInfo = mesh.getBoundingInfo();
  const offsetX = boundingInfo.boundingBox.extendSize.x * mesh.scaling.x;

  return canvasX + offsetX;
}

export function gameToSceneY(gameY: number, mesh: Mesh): number {
  const gameHeight = defaultGameParams.dimensions.gameHeight;
  const scaleFactor = defaultGameParams.dimensions.scaleFactor;
  const canvasY = -((gameY - gameHeight / 2) / scaleFactor);

  const boundingInfo = mesh.getBoundingInfo();
  const offsetY = boundingInfo.boundingBox.extendSize.y * mesh.scaling.y;

  return canvasY - offsetY;
}

export function gameToSceneSize(gameSize: number): number {
  return gameSize / defaultGameParams.dimensions.scaleFactor;
}

export function createSafeTexture(url: string, scene: Scene, onLoad?: () => void): Texture {
  const texture = new Texture(url, scene, false, true, Texture.TRILINEAR_SAMPLINGMODE, () => {
    texture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
    if (onLoad) onLoad();
  });

  texture.delayLoadState = Engine.DELAYLOADSTATE_NOTLOADED;
  return texture;
}

export function enableRequiredExtensions(engine: Engine): void {
  const gl = engine._gl as WebGLRenderingContext;

  if (gl) {
    gl.getExtension('EXT_float_blend');
    gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    gl.getExtension('OES_texture_half_float_linear');
  }
}

export function detectCollision(prevDx: number, newDx: number, newY: number): 'dx' | 'dy' | null {
  const gameHeight = defaultGameParams.dimensions.gameHeight;
  const ballSize = defaultGameParams.ball.size;
  const dxCollision = Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = newY === 0 || newY === gameHeight - ballSize;

  if (dxCollision) return 'dx';
  if (dyCollision) return 'dy';

  return null;
}

export function detectScore(
  player1Score: number,
  player2Score: number,
  lastScoreRef: { value: number },
  ballDx: number
): 'player1' | 'player2' | null {
  const currentScore = player1Score + player2Score;

  if (currentScore === lastScoreRef.value) return null;

  if (ballDx < 0) {
    lastScoreRef.value = currentScore;
    return 'player2';
  } else {
    lastScoreRef.value = currentScore;
    return 'player1';
  }
}

export function getThemeColorsFromDOM(theme: 'light' | 'dark' = 'dark') {
  const computedStyle = getComputedStyle(document.documentElement);
  document.documentElement.setAttribute('data-theme', theme);

  const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
  const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim();
  const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();
  const gameboardColor = computedStyle.getPropertyValue('--color-gameboard').trim();
  const sceneBackgroundColor = computedStyle.getPropertyValue('--color-scene-background').trim();

  return getThemeColors(
    primaryColor,
    secondaryColor,
    backgroundColor,
    gameboardColor,
    sceneBackgroundColor
  );
}

function optimizeShadowGenerators(shadowGenerators: ShadowGenerator[]) {
  shadowGenerators.forEach((generator) => {
    generator.useBlurExponentialShadowMap = true;
    generator.blurKernel = 8;
    generator.bias = 0.01;
    generator.mapSize = 512;
    generator.forceBackFacesOnly = true;
    generator.usePercentageCloserFiltering = false;
  });
}

export function applyLowQualitySettings(
  scene: Scene,
  scalingLevel: number,
  pipeline?: DefaultRenderingPipeline | null | undefined,
  shadowGenerators?: ShadowGenerator[] | null | undefined
) {
  scene.getEngine().setHardwareScalingLevel(scalingLevel);

  scene.shadowsEnabled = true;
  scene.lightsEnabled = true;
  scene.skipFrustumClipping = true;
  scene.skipPointerMovePicking = true;

  if (pipeline) {
    pipeline.bloomEnabled = true;
    pipeline.depthOfFieldEnabled = true;
    pipeline.chromaticAberrationEnabled = true;
    pipeline.grainEnabled = true;
    pipeline.fxaaEnabled = true;
    pipeline.samples = 1;
  }

  // Enable occlusion culling
  scene.autoClear = false;
  scene.autoClearDepthAndStencil = false;
  scene.blockMaterialDirtyMechanism = true;

  if (shadowGenerators) {
    optimizeShadowGenerators(shadowGenerators);
  }
}

export function isPowerUpNegative(type: PowerUpType): boolean {
  return type === PowerUpType.SmallerPaddle || type === PowerUpType.SlowerPaddle;
}

export function getPowerUpIconPath(powerUpType: PowerUpType) {
  const baseUrl = 'textures/power-up/';
  switch (powerUpType) {
    case PowerUpType.BiggerPaddle:
      return baseUrl + 'paddle_bigger.png';
    case PowerUpType.SmallerPaddle:
      return baseUrl + 'paddle_smaller.png';
    case PowerUpType.FasterPaddle:
      return baseUrl + 'paddle_faster.png';
    case PowerUpType.SlowerPaddle:
      return baseUrl + 'paddle_slower.png';
    case PowerUpType.MoreSpin:
      return baseUrl + 'paddle_spin.png';
    default:
      return baseUrl + 'unknown_powerup.png';
  }
}

export function getPowerUpSignPath(powerUpType: PowerUpType) {
  const baseUrl = 'textures/power-up/';
  switch (powerUpType) {
    case PowerUpType.BiggerPaddle:
      return baseUrl + 'sign_plus.png';
    case PowerUpType.SmallerPaddle:
      return baseUrl + 'sign_minus.png';
    case PowerUpType.FasterPaddle:
      return baseUrl + 'sign_fast.png';
    case PowerUpType.SlowerPaddle:
      return baseUrl + 'sign_slow.png';
    case PowerUpType.MoreSpin:
      return baseUrl + 'sign_spin.png';
    default:
      return baseUrl + 'sign_unknown.png';
  }
}
