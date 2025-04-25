import {
  Color3,
  DefaultRenderingPipeline,
  DynamicTexture,
  Engine,
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
  pipeline: DefaultRenderingPipeline,
  shadowGenerators: ShadowGenerator[]
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

  optimizeShadowGenerators(shadowGenerators);
}

export function getPowerUpIconPath(powerUpType: PowerUpType) {
  switch (powerUpType) {
    case PowerUpType.BiggerPaddle:
      return '/power-up/paddle_bigger.png';
    case PowerUpType.SmallerPaddle:
      return '/power-up/paddle_smaller.png';
    case PowerUpType.FasterPaddle:
      return '/power-up/paddle_faster.png';
    case PowerUpType.SlowerPaddle:
      return '/power-up/paddle_slower.png';
    case PowerUpType.MoreSpin:
      return '/power-up/paddle_spin.png';
    default:
      return '/power-up/unknown_powerup.png';
  }
}

export function getPowerUpSignPath(powerUpType: PowerUpType) {
  switch (powerUpType) {
    case PowerUpType.BiggerPaddle:
      return '/power-up/sign_plus.png';
    case PowerUpType.SmallerPaddle:
      return '/power-up/sign_minus.png';
    case PowerUpType.FasterPaddle:
      return '/power-up/sign_fast.png';
    case PowerUpType.SlowerPaddle:
      return '/power-up/sign_slow.png';
    case PowerUpType.MoreSpin:
      return '/power-up/sign_spin.png';
    default:
      return '/power-up/sign_unknown.png';
  }
}
