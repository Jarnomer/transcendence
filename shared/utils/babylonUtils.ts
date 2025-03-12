import { Color3, MeshBuilder, PBRMaterial, Scene } from 'babylonjs';

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

  // Create the float effect
  floor.position.z = 2;

  // Rotate to side view
  floor.rotation.x = Math.PI / 2;

  pbr.metallic = 1.0;
  pbr.roughness = 0.1;
  pbr.environmentIntensity = 1.5;
  pbr.albedoColor = color;

  pbr.emissiveColor = new Color3(color.r * 0.05, color.g * 0.05, color.b * 0.05);

  if (scene.environmentTexture) {
    pbr.reflectionTexture = scene.environmentTexture;
  }

  floor.material = pbr;

  return floor;
}

export function createPaddle(scene: Scene, color: Color3) {
  const pbr = new PBRMaterial('ballPBRMat', scene);
  const mesh = MeshBuilder.CreateBox(
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
  pbr.environmentIntensity = 1.0;
  pbr.albedoColor = color;

  pbr.emissiveColor = new Color3(color.r * 0.5, color.g * 0.5, color.b * 0.5);

  if (scene.environmentTexture) {
    pbr.reflectionTexture = scene.environmentTexture;
  }

  mesh.material = pbr;

  return mesh;
}

export function createBall(scene: Scene, color: Color3, diameter: number = 0.8) {
  const pbr = new PBRMaterial('ballMaterial', scene);
  const mesh = MeshBuilder.CreateSphere(
    'ball',
    {
      diameter: diameter,
      segments: 32,
    },
    scene
  );

  pbr.metallic = 1.0;
  pbr.roughness = 0.1;
  pbr.environmentIntensity = 1.0;
  pbr.albedoColor = color;

  pbr.emissiveColor = new Color3(color.r * 0.7, color.g * 0.7, color.b * 0.7);

  if (scene.environmentTexture) {
    pbr.reflectionTexture = scene.environmentTexture;
  }

  mesh.material = pbr;

  return mesh;
}
