import { defaultGameParams } from './gameTypes';

export interface GameObjectParams {
  distanceFromFloor: number;
  ball: {
    diameter: number;
    segments: number;
    emissiveColorMultiplier: number;
    emissiveIntensity: number;
    materialMetallic: number;
    materialRoughness: number;
    environmentIntensity: number;
    glowLayerIntensity: number;
    glowLayerBlurKernelSize: number;
    refractionIntensity: number;
    indexOfRefraction: number;
    translucencyIntensity: number;
    animation: {
      bottomValue: number;
      topValue: number;
    };
  };
  paddle: {
    height: number;
    width: number;
    depth: number;
    emissiveColorMultiplier: number;
    emissiveIntensity: number;
    materialMetallic: number;
    materialRoughness: number;
    environmentIntensity: number;
    glowLayerIntensity: number;
    glowLayerBlurKernelSize: number;
    refractionIntensity: number;
    indexOfRefraction: number;
    translucencyIntensity: number;
    animation: {
      bottomValue: number;
      topValue: number;
    };
  };
  edge: {
    width: number;
    radius: number;
    numPoints: number;
    tessellation: number;
    emissiveColorMultiplier: number;
    emissiveIntensity: number;
    materialMetallic: number;
    materialRoughness: number;
    environmentIntensity: number;
    refractionIntensity: number;
    indexOfRefraction: number;
    translucencyIntensity: number;
    glowLayerIntensity: number;
    glowLayerBlurKernelSize: number;
    animation: {
      bottomValue: number;
      topValue: number;
    };
  };
  floor: {
    width: number;
    depth: number;
    positionZ: number;
    colorMultiplier: number;
    emissiveColorMultiplier: number;
    metallic: number;
    roughness: number;
    microSurface: number;
    environmentIntensity: number;
    reflectivityColor: {
      r: number;
      g: number;
      b: number;
    };
    parallaxScaleBias: number;
    ambientTextureStrength: number;
    clearCoat: {
      intensity: number;
      roughness: number;
    };
    textureAnisotropicLevel: number;
  };
}

export const defaultGameObjectParams: GameObjectParams = {
  distanceFromFloor: -0.2,
  ball: {
    diameter: defaultGameParams.ball.size / defaultGameParams.dimensions.scaleFactor,
    segments: 32,
    emissiveColorMultiplier: 1.2,
    emissiveIntensity: 2.0,
    materialMetallic: 0.1,
    materialRoughness: 1.0,
    environmentIntensity: 1.2,
    glowLayerIntensity: 0.3,
    glowLayerBlurKernelSize: 64,
    refractionIntensity: 0.5,
    indexOfRefraction: 1.5,
    translucencyIntensity: 1.0,
    animation: {
      bottomValue: 0.3,
      topValue: 0.8,
    },
  },
  paddle: {
    height: defaultGameParams.paddle.height / defaultGameParams.dimensions.scaleFactor,
    width: defaultGameParams.paddle.width / defaultGameParams.dimensions.scaleFactor,
    depth: (defaultGameParams.paddle.width / defaultGameParams.dimensions.scaleFactor) * 1.5,
    emissiveColorMultiplier: 0.8,
    emissiveIntensity: 1.0,
    materialMetallic: 0.6,
    materialRoughness: 0.2,
    environmentIntensity: 0.8,
    glowLayerIntensity: 0.2,
    glowLayerBlurKernelSize: 32,
    refractionIntensity: 0.5,
    indexOfRefraction: 1.5,
    translucencyIntensity: 1.0,
    animation: {
      bottomValue: 0.2,
      topValue: 0.5,
    },
  },
  edge: {
    width: defaultGameParams.dimensions.gameWidth / defaultGameParams.dimensions.scaleFactor,
    radius: 0.15,
    numPoints: 90,
    tessellation: 16,
    emissiveColorMultiplier: 1.8,
    emissiveIntensity: 0.5,
    materialMetallic: 0.0,
    materialRoughness: 0.1,
    environmentIntensity: 1.0,
    refractionIntensity: 0.8,
    indexOfRefraction: 1.5,
    translucencyIntensity: 1.0,
    glowLayerIntensity: 0.5,
    glowLayerBlurKernelSize: 64,
    animation: {
      bottomValue: 0.2,
      topValue: 0.5,
    },
  },
  floor: {
    width:
      (defaultGameParams.dimensions.gameWidth / defaultGameParams.dimensions.scaleFactor) * 1.55,
    depth:
      (defaultGameParams.dimensions.gameHeight / defaultGameParams.dimensions.scaleFactor) * 1.55,
    positionZ: 1.2,
    colorMultiplier: 0.15,
    emissiveColorMultiplier: 0.1,
    metallic: 0.8,
    roughness: 0.2,
    microSurface: 0.9,
    environmentIntensity: 1.5,
    reflectivityColor: {
      r: 0.8,
      g: 0.8,
      b: 0.8,
    },
    parallaxScaleBias: 0.3,
    ambientTextureStrength: 3.0,
    clearCoat: {
      intensity: 0.5,
      roughness: 0.1,
    },
    textureAnisotropicLevel: 16,
  },
};
