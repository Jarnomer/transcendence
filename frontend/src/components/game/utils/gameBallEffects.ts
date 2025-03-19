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

import { createParticleTexture, updateMotionBlur } from '@game/utils';

export function createBallTrail(ballMesh: any, color: Color3, scene: Scene) {
  if (ballMesh.trailParticleSystem) ballMesh.trailParticleSystem.dispose();

  const particleSystem = new ParticleSystem('ballTrail', 500, scene);

  particleSystem.particleTexture = createParticleTexture(scene, color);
  particleSystem.emitter = ballMesh;

  // Create a slightly bluer version for the "dead" color
  const deadColorR = Math.max(0, color.r * 0.7);
  const deadColorG = Math.max(0, color.g * 0.7);
  const deadColorB = Math.min(1, color.b * 1.3);

  // Make the emission box slightly offset to follow behind the ball
  particleSystem.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
  particleSystem.maxEmitBox = new Vector3(0.1, 0.1, 0.1);

  particleSystem.color1 = new Color4(color.r, color.g, color.b, 0.8);
  particleSystem.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 0.9);
  particleSystem.colorDead = new Color4(deadColorR, deadColorG, deadColorB, 0);

  // Base settings for the trail
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  particleSystem.minLifeTime = 0.1;
  particleSystem.maxLifeTime = 0.5;
  particleSystem.emitRate = 100;
  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 3;

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

  // Create a radial gradient for the alpha channel
  const gradient = context.createRadialGradient(
    textureSize / 2,
    textureSize / 2,
    0,
    textureSize / 2,
    textureSize / 2,
    textureSize / 2
  );

  gradient.addColorStop(0, 'white');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, textureSize, textureSize);

  alphaTexture.update();

  // Make material translucent
  ringMaterial.alpha = 0.7;
  ringMaterial.backFaceCulling = false;
  ringMaterial.transparencyMode = 2;

  ringMaterial.metallic = 0.1;
  ringMaterial.roughness = 1.0;
  ringMaterial.environmentIntensity = 0.5;

  ringMaterial.opacityTexture = alphaTexture;
  spinRing.material = ringMaterial;
  spinRing.parent = ballMesh;
  spinRing.visibility = 0;

  ballMesh.spinRing = spinRing;

  return spinRing;
}

export function applyBallTrail(ballMesh: any, speed: number, color: Color3, scene: Scene) {
  if (!ballMesh.trailParticleSystem) createBallTrail(ballMesh, color, scene);

  const particleSystem = ballMesh.trailParticleSystem;

  if (speed < 0.1) {
    particleSystem.emitRate = 1;
    particleSystem.minEmitPower = 0.1;
    particleSystem.maxEmitPower = 0.5;
    return;
  }

  // Calculate direction vectors based on rotation
  const ballRotation = ballMesh.rotation.z || 0;
  const dirX = -Math.cos(ballRotation);
  const dirY = -Math.sin(ballRotation);

  // Set direction opposite to where the ball is facing
  particleSystem.direction1 = new Vector3(dirX, dirY, 0);
  particleSystem.direction2 = new Vector3(dirX * 0.8, dirY * 0.8, 0);

  // Adjust emission box to be offset in the opposite direction
  const offsetMagnitude = 0.2 + (ballMesh.scaling.x - 1) * 0.5;
  particleSystem.minEmitBox = new Vector3(
    dirX * offsetMagnitude - 0.1,
    dirY * offsetMagnitude - 0.1,
    -0.1
  );
  particleSystem.maxEmitBox = new Vector3(
    dirX * offsetMagnitude + 0.1,
    dirY * offsetMagnitude + 0.1,
    0.1
  );

  // Particle properties based on speed factor
  const speedFactor = Math.min(Math.max(speed / 5, 1.5), 3.5);
  particleSystem.minSize = 0.1 * speedFactor;
  particleSystem.maxSize = 0.6 * speedFactor;
  particleSystem.minLifeTime = 0.1;
  particleSystem.maxLifeTime = 0.3;
  particleSystem.emitRate = 5 * (speedFactor * 10);
  particleSystem.minEmitPower = 0.2 * speedFactor;
  particleSystem.maxEmitPower = 3 * speedFactor;

  // Adjust particle alpha channel based on speed
  const alphaScale = Math.min(1, 0.6 + speed * 0.03);
  particleSystem.color1 = new Color4(
    particleSystem.color1.r,
    particleSystem.color1.g,
    particleSystem.color1.b,
    0.8 * alphaScale
  );
  particleSystem.color2 = new Color4(
    particleSystem.color2.r,
    particleSystem.color2.g,
    particleSystem.color2.b,
    0.9 * alphaScale
  );
}

export function applySpinEffect(
  ballMesh: any,
  spin: number,
  speed: number,
  color: Color3,
  scene: Scene
) {
  // Create the spin ring if it doesn't exist
  if (!ballMesh.spinRing) createSpinRing(ballMesh, color, scene);

  const spinRing = ballMesh.spinRing;

  // Hide ring if spin is negligible
  if (Math.abs(spin) < 0.1) {
    spinRing.visibility = 0;
    return;
  }

  // Calculate factor values based on speed and spin
  const spinFactor = Math.min(Math.abs(spin) / 20, 0.2);
  const speedFactor = Math.min(Math.max(speed / 50, 0), 0.5);
  const combinedFactor = Math.max(speedFactor, spinFactor);

  spinRing.visibility = combinedFactor * 0.5;
  spinRing.rotation.z += combinedFactor;

  if (speed > 0.1) {
    const ballRotation = ballMesh.rotation.z || 0;
    spinRing.rotation.y = Math.PI / 2;
    spinRing.rotation.x = ballRotation;
  }

  spinRing.scaling.x = 1 + combinedFactor * 0.3;
  spinRing.scaling.y = 1 + combinedFactor * 0.3;

  // Update ring material properties based on spin
  if (spinRing.material) {
    const material = spinRing.material as PBRMaterial;
    const emissiveIntensity = 1 + spinFactor * 1.5;
    material.emissiveIntensity = emissiveIntensity;
    material.alpha = 0.3 + spinFactor * 0.25;
  }

  if (Math.abs(spin) > 3 && !ballMesh.spinParticles) {
    const particleSystem = new ParticleSystem('spinParticles', 200, scene);
    particleSystem.particleTexture = createParticleTexture(scene, color);
    particleSystem.emitter = ballMesh;

    // Emit particles from the edge of the ball
    particleSystem.minEmitBox = new Vector3(-0.2, -0.2, -0.05);
    particleSystem.maxEmitBox = new Vector3(0.2, 0.2, 0.05);

    particleSystem.color1 = new Color4(color.r, color.g, color.b, 0.7);
    particleSystem.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 0.8);
    particleSystem.colorDead = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0);

    // Particle properties
    particleSystem.minSize = 0.04;
    particleSystem.maxSize = 0.15;
    particleSystem.minLifeTime = 0.1;
    particleSystem.maxLifeTime = 0.25;
    particleSystem.emitRate = (10 * combinedFactor) / 2;
    particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

    // Add gravity to make particles fall away slightly
    particleSystem.gravity = new Vector3(0, 0, -0.5);

    // Radial emission
    particleSystem.minEmitPower = 0.5;
    particleSystem.maxEmitPower = 1.5;
    particleSystem.addSizeGradient(0, 0.5);
    particleSystem.addSizeGradient(1.0, 0);

    particleSystem.start();
    ballMesh.spinParticles = particleSystem;
  }

  // Update particle emission rate based on spin
  if (ballMesh.spinParticles) {
    if (Math.abs(spin) > 2) {
      ballMesh.spinParticles.emitRate = 40 * Math.min(Math.abs(spin) / 3, 1.2); // Reduced emission rate
    } else {
      ballMesh.spinParticles.emitRate = 0;
    }
  }
}

export function applyBallOvalityWithSpin(
  ballMesh: any,
  angle: number,
  speed: number,
  spin: number
) {
  // Store the original scale if not already saved
  if (!ballMesh.originalScale) ballMesh.originalScale = new Vector3(1, 1, 1);

  const shapeDampingFactor = 0.5; // How quickly the shape changes
  const rotationDampingFactor = 0.3; // How quickly the rotation changes
  const spinFactor = Math.min(Math.abs(spin) / 5, 1); // Normalized spin factor

  if (speed < 0.1 && Math.abs(spin) < 0.1) {
    // Ball is nearly stationary with no spin - gradually return to original shape
    if (Math.abs(ballMesh.scaling.x - 1) > 0.01 || Math.abs(ballMesh.scaling.y - 1) > 0.01) {
      const newX = ballMesh.scaling.x + (1 - ballMesh.scaling.x) * shapeDampingFactor;
      const newY = ballMesh.scaling.y + (1 - ballMesh.scaling.y) * shapeDampingFactor;
      ballMesh.scaling = new Vector3(newX, newY, 1);
    }
    return;
  }

  const speedDivisor = 50; // Increase for less effect
  const maxOvality = 0.3; // Increase for less ovality
  const stretchMultiplier = 0.5; // Increase for more ovality
  const compressionFactor = 0.3; // Increase for more ovality

  // Calculate speed-based deformation (from original function)
  const speedFactor = Math.min(speed / speedDivisor, maxOvality);
  let targetScaleX = 1 + speedFactor * stretchMultiplier;
  let targetScaleY = 1 - speedFactor * compressionFactor;

  // When spin is high, morph toward a disc shape
  if (Math.abs(spin) > 1) {
    const blendFactor = spinFactor * 0.4;
    const discScaleX = 1 + spinFactor * 0.3;
    const discScaleY = 1 + spinFactor * 0.3;
    const targetScaleZ = 1 - spinFactor * 0.4;

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

  const spinRotation = spin * 0.03; // Adjust multiplier to control rotation speed

  // Combine regular movement-based rotation with spin-based rotation
  const newRotation = currentRotation + rotationDiff * rotationDampingFactor + spinRotation;
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

  applyBallOvalityWithSpin(ballMesh, angle, speed, spin);
  applyBallTrail(ballMesh, speed, color, scene);
  applySpinEffect(ballMesh, spin, speed, color, scene);

  if (scene.activeCamera) {
    updateMotionBlur(speed, scene.activeCamera);
  }
}
