import { Engine, Mesh, Scene, Texture, DefaultRenderingPipeline } from 'babylonjs';

import { getThemeColors } from '@game/utils';

import { defaultGameParams } from '@shared/types';

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

  return getThemeColors(theme, primaryColor, secondaryColor, backgroundColor);
}

export function applyLowQualitySettings(scene: Scene, pipeline: DefaultRenderingPipeline | null) {
  scene.getEngine().setHardwareScalingLevel(2.0);

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
}

export function optimizeShadowGenerators(shadowGenerators: any[]) {
  shadowGenerators.forEach((generator) => {
    generator.useBlurExponentialShadowMap = true;
    generator.blurKernel = 8;
    generator.bias = 0.01;
    generator.mapSize = 512;
    generator.forceBackFacesOnly = true;
    generator.usePercentageCloserFiltering = false;
  });
}
