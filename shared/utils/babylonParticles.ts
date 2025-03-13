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

export function createBallTrail(ballMesh: any, speed: number, color: Color3, scene: Scene) {
  const particleSystem = new ParticleSystem('ballTrail', 500, scene);

  // Create a slightly bluer version for the "dead" color
  const deadColorR = Math.max(0, color.r * 0.7);
  const deadColorG = Math.max(0, color.g * 0.7);
  const deadColorB = Math.min(1, color.b * 1.3);

  particleSystem.particleTexture = createParticleTexture(scene, color);
  particleSystem.emitter = ballMesh;

  particleSystem.minEmitBox = new Vector3(-0.1, -0.1, -0.1);
  particleSystem.maxEmitBox = new Vector3(0.1, 0.1, 0.1);

  particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
  particleSystem.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 1.0);
  particleSystem.colorDead = new Color4(deadColorR, deadColorG, deadColorB, 0);

  // Size, lifetime, emission rate and speed
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;
  particleSystem.minLifeTime = 0.1;
  particleSystem.maxLifeTime = 0.5;
  particleSystem.emitRate = 100;
  particleSystem.minEmitPower = 1;
  particleSystem.maxEmitPower = 3;

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  // Set slightly negative to make particles float upward
  particleSystem.gravity = new Vector3(0, -0.1, 0);

  // Direction - will be updated based on ball velocity
  particleSystem.direction1 = new Vector3(-1, 0, 0);
  particleSystem.direction2 = new Vector3(-1, 0, 0);

  particleSystem.start();

  ballMesh.trailParticleSystem = particleSystem;

  return particleSystem;
}

export function updateBallTrail(ballMesh: any, dx: number, dy: number) {
  if (!ballMesh || !ballMesh.trailParticleSystem) return;

  const ps = ballMesh.trailParticleSystem;
  const speed = Math.sqrt(dx * dx + dy * dy);

  // Normalize direction vectors to opposite of ball movement
  const normalizedDx = dx !== 0 ? -dx / Math.abs(dx) : 0;
  const normalizedDy = dy !== 0 ? -dy / Math.abs(dy) : 0;

  // Set direction based on ball velocity opposite to movement
  ps.direction1 = new Vector3(normalizedDx, normalizedDy, 0);
  ps.direction2 = new Vector3(normalizedDx * 0.8, normalizedDy * 0.8, 0);

  // Scale emission rate and power with speed
  ps.emitRate = 50 + speed * 20;
  ps.minEmitPower = 0.5 + speed * 0.5;
  ps.maxEmitPower = 1.5 + speed * 1.0;

  // Scale particle lifetime and size with speed
  ps.minLifeTime = 0.1 + speed * 0.05;
  ps.maxLifeTime = 0.3 + speed * 0.1;
  ps.minSize = 0.1 + speed * 0.03;
  ps.maxSize = 0.3 + speed * 0.1;
}

export function applyBallOvality(ballMesh: any, dx: number, dy: number, speed: number) {
  const shapeDampingFactor = 0.5; // How quickly the shape changes
  const rotationDampingFactor = 0.3; // How quickly the rotation changes

  // Store the original scale if not already saved
  if (!ballMesh.originalScale) {
    ballMesh.originalScale = new Vector3(1, 1, 1);
  }

  const speedDivisor = 50; // Increase for less effect / speed
  const maxElongation = 0.3; // Increase for less ovality

  // Calculate the elongation based on speed with new parameters
  const speedFactor = Math.min(speed / speedDivisor, maxElongation);

  if (speed < 0.1) {
    // Ball is nearly stationary - gradually return to original shape
    if (Math.abs(ballMesh.scaling.x - 1) > 0.01 || Math.abs(ballMesh.scaling.y - 1) > 0.01) {
      const newX = ballMesh.scaling.x + (1 - ballMesh.scaling.x) * shapeDampingFactor;
      const newY = ballMesh.scaling.y + (1 - ballMesh.scaling.y) * shapeDampingFactor;
      ballMesh.scaling = new Vector3(newX, newY, 1);
    }
    return;
  }

  // Smaller numbers = less pronounced oval
  const xStretchMultiplier = 0.5;
  const yCompressionFactor = 0.3;

  // Apply the multipliers to the transformation
  const targetScaleX = 1 + speedFactor * xStretchMultiplier;
  const targetScaleY = 1 - speedFactor * yCompressionFactor;

  // Apply smooth transition to target scale
  ballMesh.scaling.x += (targetScaleX - ballMesh.scaling.x) * shapeDampingFactor;
  ballMesh.scaling.y += (targetScaleY - ballMesh.scaling.y) * shapeDampingFactor;
  ballMesh.scaling.z = 1; // Keep Z constant

  // Calculate the rotational angle of movement
  const angle = Math.atan2(dy, dx);

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

  const speed = Math.sqrt(dx * dx + dy * dy);

  applyBallOvality(ballMesh, dx, dy, speed);
}
