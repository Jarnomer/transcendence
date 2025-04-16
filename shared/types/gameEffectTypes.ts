export interface BallEffectsParams {
  ovality: {
    shapeDampingFactor: number;
    rotationDampingFactor: number;
    spinDivisor: number;
    speedDivisor: number;
    maxOvality: number;
    xStretchMultiplier: number;
    yCompressionFactor: number;
    limits: {
      spinFactor: {
        min: number;
        max: number;
      };
    };
  };
  spin: {
    spinDivisor: number;
    speedDivisor: number;
    scaleMultiplier: number;
    alphaMultiplier: number;
    baseEmitRate: number;
    limits: {
      spinFactor: {
        min: number;
        max: number;
      };
      speedFactor: {
        min: number;
        max: number;
      };
    };
    particle: {
      minSize: number;
      maxSize: number;
      minLifeTime: number;
      maxLifeTime: number;
      minEmitPower: number;
      maxEmitPower: number;
    };
  };
  trail: {
    speedDivisor: number;
    baseEmitRate: number;
    emitSpeedMultiplier: number;
    offsetMagnitude: number;
    alphaScaleDivisor: number;
    limits: {
      speedFactor: {
        min: number;
        max: number;
      };
    };
    particle: {
      minSize: number;
      maxSize: number;
      minLifeTime: number;
      maxLifeTime: number;
      minEmitPower: number;
      maxEmitPower: number;
    };
  };
}

export const defaultBallEffectsParams: BallEffectsParams = {
  ovality: {
    shapeDampingFactor: 0.5,
    rotationDampingFactor: 0.3,
    spinDivisor: 5,
    speedDivisor: 50,
    maxOvality: 0.3,
    xStretchMultiplier: 0.5,
    yCompressionFactor: 0.3,
    limits: {
      spinFactor: {
        min: 0.8,
        max: 1.4,
      },
    },
  },
  spin: {
    spinDivisor: 10,
    speedDivisor: 50,
    scaleMultiplier: 0.7,
    alphaMultiplier: 0.8,
    baseEmitRate: 40,
    limits: {
      spinFactor: {
        min: 0.3,
        max: 0.5,
      },
      speedFactor: {
        min: 0.4,
        max: 0.8,
      },
    },
    particle: {
      minSize: 0.05,
      maxSize: 0.15,
      minLifeTime: 0.2,
      maxLifeTime: 0.2,
      minEmitPower: 3.5,
      maxEmitPower: 4.5,
    },
  },
  trail: {
    speedDivisor: 5,
    baseEmitRate: 50,
    emitSpeedMultiplier: 20,
    offsetMagnitude: 0.1,
    alphaScaleDivisor: 4,
    limits: {
      speedFactor: {
        min: 1.0,
        max: 4.0,
      },
    },
    particle: {
      minSize: 0.1,
      maxSize: 0.6,
      minLifeTime: 0.1,
      maxLifeTime: 0.3,
      minEmitPower: 0.2,
      maxEmitPower: 3.0,
    },
  },
};
