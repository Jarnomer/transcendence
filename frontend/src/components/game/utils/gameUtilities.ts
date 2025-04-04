import { Mesh } from 'babylonjs';

import { defaultGameParams } from '@shared/types';

export function gameToSceneX(gameX: number, mesh: Mesh): number {
  const gameWidth = defaultGameParams.gameWidth;
  const scaleFactor = defaultGameParams.scaleFactor;
  const canvasX = (gameX - gameWidth / 2) / scaleFactor;
  const boundingInfo = mesh.getBoundingInfo();
  const offsetX = boundingInfo.boundingBox.extendSize.x * mesh.scaling.x;
  return canvasX + offsetX;
}

export function gameToSceneY(gameY: number, mesh: Mesh): number {
  const gameHeight = defaultGameParams.gameHeight;
  const scaleFactor = defaultGameParams.scaleFactor;
  const canvasY = -((gameY - gameHeight / 2) / scaleFactor);
  const boundingInfo = mesh.getBoundingInfo();
  const offsetY = boundingInfo.boundingBox.extendSize.y * mesh.scaling.y;
  return canvasY - offsetY;
}
