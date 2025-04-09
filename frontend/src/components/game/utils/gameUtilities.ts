import { Mesh } from 'babylonjs';

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

export function enforceBoundary(
  position: number,
  objectHeight: number,
  gameHeight: number = defaultGameParams.dimensions.gameHeight
): number {
  const halfHeight = objectHeight / 2;
  return Math.max(halfHeight, Math.min(gameHeight - halfHeight, position));
}
