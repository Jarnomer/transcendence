import {
  Color3,
  Color4,
  DynamicTexture,
  MeshBuilder,
  ParticleSystem,
  PBRMaterial,
  Scene,
  Vector3,
} from 'babylonjs';

import { createParticleTexture } from '@game/utils';

import { BallEffectsParams, defaultBallEffectsParams } from '@shared/types';

export function createBallTrail(
  ballMesh: any,
  color: Color3,
  scene: Scene,
  params: BallEffectsParams = defaultBallEffectsParams
) {
  const { particle } = params.trail;

  if (ballMesh.trailParticleSystem) ballMesh.trailParticleSystem.dispose();

  const particleSystem = new ParticleSystem('ballTrail', 500, scene);

  particleSystem.particleTexture = createParticleTexture(scene, color);
  particleSystem.emitter = ballMesh;

  // Make the emission box slightly offset to follow behind the ball
  particleSystem.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
  particleSystem.maxEmitBox = new Vector3(0.1, 0.1, 0.1);

  particleSystem.color1 = new Color4(color.r, color.g, color.b, 0.8);
  particleSystem.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 0.9);

  // Base settings for the trail
  particleSystem.minSize = particle.minSize;
  particleSystem.maxSize = particle.maxSize;
  particleSystem.minLifeTime = particle.minLifeTime;
  particleSystem.maxLifeTime = particle.maxLifeTime;
  particleSystem.emitRate = params.trail.baseEmitRate;
  particleSystem.minEmitPower = particle.minEmitPower;
  particleSystem.maxEmitPower = particle.maxEmitPower;

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  // Initialize with default direction
  particleSystem.direction1 = new Vector3(-1, 0, 0);
  particleSystem.direction2 = new Vector3(-1, 0, 0);

  particleSystem.start();

  ballMesh.trailParticleSystem = particleSystem;

  return particleSystem;
}

export function createSpinRing(ballMesh: any, color: Color3, scene: Scene) {
  if (ballMesh.spinRing) ballMesh.spinRing.dispose();

  const diameter = ballMesh.getBoundingInfo().boundingSphere.radius * 2;
  const spinRing = MeshBuilder.CreateTorus(
    'spinRing',
    {
      diameter: diameter * 1.2,
      thickness: diameter * 0.2,
      tessellation: 48,
    },
    scene
  );

  const ringMaterial = new PBRMaterial('spinRingMaterial', scene);

  ringMaterial.emissiveColor = new Color3(color.r, color.g, color.b);
  ringMaterial.albedoColor = new Color3(0, 0, 0);

  // Create alpha texture for the fade effect
  const textureSize = 256;
  const alphaTexture = new DynamicTexture('spinRingAlpha', textureSize, scene, false);
  const context = alphaTexture.getContext();

  context.fillRect(0, 0, textureSize, textureSize);

  alphaTexture.update();

  // Material settings
  ringMaterial.metallic = 0.1;
  ringMaterial.roughness = 1.0;
  ringMaterial.backFaceCulling = false;
  ringMaterial.environmentIntensity = 0.5;
  ringMaterial.opacityTexture = alphaTexture;
  ringMaterial.transparencyMode = 2;
  ringMaterial.alpha = 0.7;

  spinRing.material = ringMaterial;
  spinRing.parent = ballMesh;
  spinRing.visibility = 0;

  ballMesh.spinRing = spinRing;

  return spinRing;
}

export function applyBallTrail(
  ballMesh: any,
  speed: number,
  color: Color3,
  scene: Scene,
  params: BallEffectsParams = defaultBallEffectsParams
) {
  const {
    baseEmitRate,
    emitSpeedMultiplier,
    alphaScaleDivisor,
    offsetMagnitude,
    speedDivisor,
    limits,
    particle,
  } = params.trail;

  if (!ballMesh.trailParticleSystem) createBallTrail(ballMesh, color, scene);

  const particleSystem = ballMesh.trailParticleSystem;

  if (speed < 0.1) {
    particleSystem.visibility = 0;
    return;
  }

  // Calculate direction vectors based on rotation
  const ballRotation = ballMesh.rotation.z || 0;
  const dirX = -Math.cos(ballRotation);
  const dirY = -Math.sin(ballRotation);
  particleSystem.visibility = 1;

  // Set direction opposite to where the ball is facing
  particleSystem.direction1 = new Vector3(dirX, dirY, 0);
  particleSystem.direction2 = new Vector3(dirX * 0.8, dirY * 0.8, 0);

  // Adjust emission box to be offset in the opposite direction
  particleSystem.minEmitBox = new Vector3(dirX * offsetMagnitude, dirY * offsetMagnitude, 0);
  particleSystem.maxEmitBox = new Vector3(dirX * offsetMagnitude, dirY * offsetMagnitude, 0);

  const speedFactor = Math.min(
    Math.max(speed / speedDivisor, limits.speedFactor.min),
    limits.speedFactor.max
  );

  particleSystem.minSize = particle.minSize * speedFactor;
  particleSystem.maxSize = particle.maxSize * speedFactor;
  particleSystem.minLifeTime = particle.minLifeTime;
  particleSystem.maxLifeTime = particle.maxLifeTime;
  particleSystem.emitRate = baseEmitRate + speedFactor * emitSpeedMultiplier;
  particleSystem.minEmitPower = particle.minEmitPower * speedFactor;
  particleSystem.maxEmitPower = particle.minEmitPower * speedFactor;

  // Adjust particle alpha channel based on speed
  const alphaScale = Math.min(1, speedFactor / alphaScaleDivisor);
  particleSystem.color1 = new Color4(
    particleSystem.color1.r,
    particleSystem.color1.g,
    particleSystem.color1.b,
    alphaScale
  );
  particleSystem.color2 = new Color4(
    particleSystem.color2.r,
    particleSystem.color2.g,
    particleSystem.color2.b,
    alphaScale
  );
}

export function applySpinEffect(
  ballMesh: any,
  spin: number,
  speed: number,
  color: Color3,
  scene: Scene,
  params: BallEffectsParams = defaultBallEffectsParams
) {
  const {
    baseEmitRate,
    spinDivisor,
    scaleMultiplier,
    alphaMultiplier,
    speedDivisor,
    limits,
    particle,
  } = params.spin;

  if (!ballMesh.spinRing) createSpinRing(ballMesh, color, scene);

  const spinRing = ballMesh.spinRing;

  if (Math.abs(spin) < 0.1) {
    spinRing.visibility = 0;
    return;
  }

  // Calculate speed and spin factors, and set combined factor
  const spinFactor = Math.max(
    Math.min(Math.abs(spin) / spinDivisor, limits.spinFactor.max),
    limits.spinFactor.min
  );
  const speedFactor = Math.max(
    Math.min(Math.abs(spin) / speedDivisor, limits.speedFactor.max),
    limits.speedFactor.min
  );
  const combinedFactor = spinFactor * speedFactor;

  spinRing.visibility = combinedFactor;
  spinRing.rotation.z += combinedFactor;

  if (speed > 0.1) {
    const ballRotation = ballMesh.rotation.z || 0;
    spinRing.rotation.y = Math.PI / 2;
    spinRing.rotation.x = ballRotation;
  }

  spinRing.scaling.x = 1 + combinedFactor * scaleMultiplier;
  spinRing.scaling.y = 1 + combinedFactor * scaleMultiplier;

  // Update ring material properties based on combined factor
  if (spinRing.material) {
    const material = spinRing.material as PBRMaterial;
    const emissiveIntensity = 1 + combinedFactor;
    material.emissiveIntensity = emissiveIntensity;
    material.alpha = combinedFactor * alphaMultiplier;
  }

  if (!ballMesh.spinParticles) {
    const particleSystem = new ParticleSystem('spinParticles', 200, scene);
    particleSystem.particleTexture = createParticleTexture(scene, color);
    particleSystem.emitter = ballMesh;

    // Emit particles from the edge of the ball
    particleSystem.minEmitBox = new Vector3(-0.2, -0.2, -0.05);
    particleSystem.maxEmitBox = new Vector3(0.2, 0.2, 0.05);

    // Color settings
    particleSystem.color1 = new Color4(color.r, color.g, color.b, 0.7);
    particleSystem.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 0.8);
    particleSystem.colorDead = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0);

    // Particle properties
    particleSystem.minSize = particle.minSize;
    particleSystem.maxSize = particle.maxSize;
    particleSystem.minLifeTime = particle.minLifeTime;
    particleSystem.maxLifeTime = particle.maxLifeTime;
    particleSystem.emitRate = combinedFactor;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    // Radial emission
    particleSystem.minEmitPower = particle.minEmitPower;
    particleSystem.maxEmitPower = particle.maxEmitPower;
    particleSystem.addSizeGradient(0, 0.5);
    particleSystem.addSizeGradient(1.0, 0);

    ballMesh.spinParticles = particleSystem;

    particleSystem.start();
  }

  // Update particle emission rate based on spin
  if (ballMesh.spinParticles) {
    if (Math.abs(spin) > 2) {
      ballMesh.spinParticles.emitRate = baseEmitRate * combinedFactor;
    } else {
      ballMesh.spinParticles.emitRate = 0;
    }
  }
}

export function applyBallOvality(
  ballMesh: any,
  angle: number,
  speed: number,
  spin: number,
  params: BallEffectsParams = defaultBallEffectsParams
) {
  const {
    shapeDampingFactor,
    spinDivisor,
    maxOvality,
    xStretchMultiplier,
    yCompressionFactor,
    speedDivisor,
    limits,
  } = params.ovality;

  if (!ballMesh.originalScale) ballMesh.originalScale = new Vector3(1, 1, 1);

  // Gradually return to original shape if stationary
  if (speed < 0.1 && Math.abs(spin) < 0.1) {
    const newX = ballMesh.scaling.x + (1 - ballMesh.scaling.x) * shapeDampingFactor;
    const newY = ballMesh.scaling.y + (1 - ballMesh.scaling.y) * shapeDampingFactor;
    ballMesh.scaling = new Vector3(newX, newY, 1);
    return;
  }

  // Calculate speed and spin factors, and set scale targets
  const spinFactor = Math.max(
    Math.min(Math.abs(spin) / spinDivisor, limits.spinFactor.max),
    limits.spinFactor.min
  );
  const speedFactor = Math.min(speed / speedDivisor, maxOvality);
  let targetScaleX = 1 + speedFactor * xStretchMultiplier;
  let targetScaleY = 1 - speedFactor * yCompressionFactor;

  // When spin is high, morph toward a disc shape
  if (Math.abs(spin) > 1) {
    const blendFactor = spinFactor * maxOvality;
    const discScaleX = 1 + spinFactor * maxOvality;
    const discScaleY = 1 + spinFactor * maxOvality;
    const targetScaleZ = 1 - spinFactor * maxOvality;

    targetScaleX = targetScaleX * (1 - blendFactor) + discScaleX * blendFactor;
    targetScaleY = targetScaleY * (1 - blendFactor) + discScaleY * blendFactor;

    ballMesh.scaling.z += (targetScaleZ - ballMesh.scaling.z) * shapeDampingFactor;
  } else {
    // No significant spin, gradually restore z scale
    ballMesh.scaling.z += (1 - ballMesh.scaling.z) * shapeDampingFactor;
  }

  // Apply smooth transition to target scale
  ballMesh.scaling.x += (targetScaleX - ballMesh.scaling.x) * shapeDampingFactor;
  ballMesh.scaling.y += (targetScaleY - ballMesh.scaling.y) * shapeDampingFactor;

  if (ballMesh._targetRotation === undefined) ballMesh._targetRotation = 0;

  ballMesh._targetRotation = angle;

  // Normalize the rotation difference to be in the range [-π, π]
  const currentRotation = ballMesh.rotation.z || 0;
  let rotationDiff = ballMesh._targetRotation - currentRotation;

  if (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
  if (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

  // Combine regular movement-based rotation with spin-based rotation
  const newRotation = currentRotation + rotationDiff + spin;

  ballMesh.rotation.z = newRotation;
}

export function applyBallEffects(
  ballMesh: any,
  speed: number,
  angle: number,
  spin: number,
  color: Color3
) {
  if (!ballMesh) return;

  const scene = ballMesh.getScene();

  applyBallOvality(ballMesh, angle, speed, spin);
  applyBallTrail(ballMesh, speed, color, scene);
  applySpinEffect(ballMesh, spin, speed, color, scene);
}
