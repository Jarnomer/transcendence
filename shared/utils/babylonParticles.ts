import { Color3, Color4, DynamicTexture, ParticleSystem, Scene, Texture, Vector3 } from 'babylonjs';

function createParticleTexture(scene: Scene, color: Color3): Texture {
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

  gradient.addColorStop(0, 'white'); // Bright center
  gradient.addColorStop(0.3, rgbColor); // Color matching the theme
  gradient.addColorStop(1, rgbaColorTransparent); // Transparent edge

  // Fill the canvas with the gradient
  context.fillStyle = gradient;
  context.fillRect(0, 0, textureSize, textureSize);

  texture.update();

  return texture;
}

export function createBallTrail(scene: Scene, ballMesh: any, color: Color3) {
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

// Update the ball trail's color when theme changes
export function updateBallTrailColor(ballMesh: any, color: Color3, scene: Scene) {
  if (!ballMesh || !ballMesh.trailParticleSystem) return;

  // Create a slightly bluer version for the "dead" color
  const deadColorR = Math.max(0, color.r * 0.7);
  const deadColorG = Math.max(0, color.g * 0.7);
  const deadColorB = Math.min(1, color.b * 1.3);
  const ps = ballMesh.trailParticleSystem;

  ps.particleTexture.dispose();
  ps.particleTexture = createParticleTexture(scene, color);

  ps.color1 = new Color4(color.r, color.g, color.b, 1.0);
  ps.color2 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 1.0);
  ps.colorDead = new Color4(deadColorR, deadColorG, deadColorB, 0);

  ballMesh.ballColor = color;
}
