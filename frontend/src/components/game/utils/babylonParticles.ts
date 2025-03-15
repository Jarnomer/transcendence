import { Color3, Color4, DynamicTexture, ParticleSystem, Scene, Texture, Vector3 } from 'babylonjs';

export function createParticleTexture(scene: Scene, color: Color3): Texture {
  const textureSize = 64;
  const texture = new DynamicTexture('particleTexture', textureSize, scene, false);
  const context = texture.getContext();

  // Create a radial gradient
  const gradient = context.createRadialGradient(
    textureSize / 2,
    textureSize / 2,
    0,
    textureSize / 2,
    textureSize / 2,
    textureSize / 2
  );

  // Convert Color3 to CSS color strings
  const rgbColor = `rgb(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)})`;
  const rgbaColorTransparent = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(color.b * 255)}, 0)`;

  // Color stops - Center, "middle" and edge
  gradient.addColorStop(0, 'white');
  gradient.addColorStop(0.3, rgbColor);
  gradient.addColorStop(1, rgbaColorTransparent);

  context.fillStyle = gradient;
  context.fillRect(0, 0, textureSize, textureSize);

  texture.update();

  return texture;
}

export function createBallTrail(ballMesh: any, color: Color3, scene: Scene) {
  // If the ball already has a trail, dispose it first
  if (ballMesh.trailParticleSystem) {
    ballMesh.trailParticleSystem.dispose();
  }

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

export function applyBallTrail(ballMesh: any, speed: number) {
  if (!ballMesh || !ballMesh.trailParticleSystem) return;

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

export function applyBallOvality(ballMesh: any, angle: number, speed: number) {
  // Store the original scale if not already saved
  if (!ballMesh.originalScale) {
    ballMesh.originalScale = new Vector3(1, 1, 1);
  }

  const shapeDampingFactor = 0.5; // How quickly the shape changes
  const rotationDampingFactor = 0.3; // How quickly the rotation changes

  if (speed < 0.1) {
    // Ball is nearly stationary - gradually return to original shape
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

  // Apply the multipliers to the transformation
  const speedFactor = Math.min(speed / speedDivisor, maxOvality);
  const targetScaleX = 1 + speedFactor * stretchMultiplier;
  const targetScaleY = 1 - speedFactor * compressionFactor;

  // Apply smooth transition to target scale
  ballMesh.scaling.x += (targetScaleX - ballMesh.scaling.x) * shapeDampingFactor;
  ballMesh.scaling.y += (targetScaleY - ballMesh.scaling.y) * shapeDampingFactor;
  ballMesh.scaling.z = 1; // Keep Z constant

  // Store the current target rotation if not already saved
  if (ballMesh._targetRotation === undefined) {
    ballMesh._targetRotation = 0;
  }

  ballMesh._targetRotation = angle;

  const currentRotation = ballMesh.rotation.z || 0;

  // Normalize the rotation difference to be in the range [-π, π]
  let rotationDiff = ballMesh._targetRotation - currentRotation;
  if (rotationDiff > Math.PI) rotationDiff -= 2 * Math.PI;
  if (rotationDiff < -Math.PI) rotationDiff += 2 * Math.PI;

  const newRotation = currentRotation + rotationDiff * rotationDampingFactor;

  ballMesh.rotation.z = newRotation;
}

export function applyBallEffects(ballMesh: any, dx: number, dy: number, color: Color3) {
  if (!ballMesh) return;

  const angle = Math.atan2(dy, dx);
  const speed = Math.sqrt(dx * dx + dy * dy);

  applyBallOvality(ballMesh, angle, speed);
  applyBallTrail(ballMesh, speed);
}
