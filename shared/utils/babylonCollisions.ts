import { Animation, Color3, Color4, ParticleSystem, PointLight, Scene, Vector3 } from 'babylonjs';

export function detectCollision(prevDx: number, prevDy: number, newDx: number, newDy: number) {
  const dxCollision = prevDx !== 0 && newDx !== 0 && Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = prevDy !== 0 && newDy !== 0 && Math.sign(prevDy) !== Math.sign(newDy);

  if (dxCollision) return 'dx';
  if (dyCollision) return 'dy';
  return null;
}

export function applyCollisionDeformEffect(
  ballMesh: any,
  collisionType: 'dx' | 'dy',
  speed: number
) {
  if (!ballMesh) return;

  // Calculate deformation amount based on speed
  const speedFactor = Math.min(Math.max(speed / 10, 0.5), 2.0);
  const deformEffect = 0.7 - speedFactor * 0.15;

  // Create scale animation with keyframes
  const frameRate = 60;
  const squishAnimation = new Animation(
    'squishAnimation',
    'scaling',
    frameRate,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  // Get current scale to avoid disrupting other animations
  const currentScale = ballMesh.scaling.clone();

  const keys = [];
  if (collisionType === 'dx') {
    keys.push({
      frame: 0,
      value: currentScale.clone(),
    });
    keys.push({
      frame: 5,
      value: new Vector3(deformEffect, deformEffect, currentScale.z),
    });
    keys.push({
      frame: 15,
      value: new Vector3(deformEffect * 0.9, deformEffect * 1.1, currentScale.z),
    });
    keys.push({
      frame: 30,
      value: currentScale.clone(),
    });
  } else {
    keys.push({
      frame: 0,
      value: currentScale.clone(),
    });
    keys.push({
      frame: 5,
      value: new Vector3(deformEffect, deformEffect, currentScale.z),
    });
    keys.push({
      frame: 15,
      value: new Vector3(deformEffect * 1.1, deformEffect * 0.9, currentScale.z),
    });
    keys.push({
      frame: 30,
      value: currentScale.clone(),
    });
  }

  squishAnimation.setKeys(keys);

  // Stop any existing animations to prevent conflicts
  ballMesh.animations = [];
  ballMesh.animations.push(squishAnimation);

  const scene = ballMesh.getScene();
  scene.beginAnimation(ballMesh, 0, 30, false, speedFactor * 1.5);
}

export function createCollisionLightEffect(
  ballMesh: any,
  collisionType: 'dx' | 'dy',
  speed: number,
  color: Color3
) {
  if (!ballMesh) return;

  const scene = ballMesh.getScene();

  // Calculate intensity and radius based on speed
  const speedFactor = Math.min(Math.max(speed, 50), 100.0);
  const lightIntensity = 10 * speedFactor;
  const lightRadius = 5 * speedFactor;

  let lightPosition;
  if (collisionType === 'dx') {
    // For dx collision (hitting left/right paddles), position light slightly to the side
    const offsetX = Math.sign(ballMesh.position.x) * -0.5;
    lightPosition = new Vector3(
      ballMesh.position.x + offsetX,
      ballMesh.position.y,
      ballMesh.position.z
    );
  } else {
    // For dy collision (hitting top/bottom walls), position light slightly above/below
    const offsetY = Math.sign(ballMesh.position.y) * -0.5;
    lightPosition = new Vector3(
      ballMesh.position.x,
      ballMesh.position.y + offsetY,
      ballMesh.position.z
    );
  }

  const light = new PointLight('collisionLight', lightPosition, scene);
  light.intensity = lightIntensity;
  light.radius = lightRadius;
  light.diffuse = color;
  light.specular = color;

  const frameRate = 60;
  const fadeAnimation = new Animation(
    'lightFadeAnimation',
    'intensity',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [];
  keys.push({ frame: 0, value: lightIntensity });
  keys.push({ frame: 5, value: lightIntensity * 1.5 });
  keys.push({ frame: 15, value: lightIntensity * 0.8 });
  keys.push({ frame: 25, value: 0 });

  fadeAnimation.setKeys(keys);
  light.animations.push(fadeAnimation);

  // Play the animation and then dispose of the light
  const animationDuration = 25;
  scene.beginAnimation(light, 0, animationDuration, false, 1, () => {
    light.dispose();
  });
}

export function createCollisionParticleEffect(
  ballMesh: any,
  collisionType: 'dx' | 'dy',
  speed: number,
  color: Color3,
  scene: Scene
) {
  if (!ballMesh) return;

  // Calculate particle effects based on speed
  const speedFactor = Math.min(Math.max(speed / 5, 80), 150);
  const particleSystem = new ParticleSystem('collisionParticles', 100, scene);

  particleSystem.emitter = ballMesh.position;

  if (collisionType === 'dx') {
    // dx collision (hitting left/right paddles) - emit particles left/right
    particleSystem.direction1 = new Vector3(-1, 1.2, 0);
    particleSystem.direction2 = new Vector3(-1, -1.2, 0);
    particleSystem.minEmitBox = new Vector3(-0.1, -0.3, -0.1);
    particleSystem.maxEmitBox = new Vector3(0.1, 0.3, 0.1);
  } else {
    // dy collision (hitting top/bottom walls) - emit particles up/down
    particleSystem.direction1 = new Vector3(1.2, -1, 0);
    particleSystem.direction2 = new Vector3(-1.2, -1, 0);
    particleSystem.minEmitBox = new Vector3(-0.3, -0.1, -0.1);
    particleSystem.maxEmitBox = new Vector3(0.3, 0.1, 0.1);
  }

  // Configure particle appearance and behavior
  particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
  particleSystem.color2 = new Color4(color.r * 1.5, color.g * 1.5, color.b * 1.5, 1.0);
  particleSystem.colorDead = new Color4(color.r * 0.5, color.g * 0.5, color.b * 0.5, 0.0);

  // Size, lifetime, emission rate and speed
  particleSystem.minSize = 0.2 * speedFactor;
  particleSystem.maxSize = 0.5 * speedFactor;
  particleSystem.minLifeTime = 0.1;
  particleSystem.maxLifeTime = 0.3;
  particleSystem.emitRate = 0; // Burst manually
  particleSystem.manualEmitCount = 150 * speedFactor;
  particleSystem.minEmitPower = 3 * speedFactor;
  particleSystem.maxEmitPower = 6 * speedFactor;

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  // Set more negative to make particles move faster
  particleSystem.gravity = new Vector3(0, -0.05, 0);

  // Add some angular velocity for more dramatic effect
  particleSystem.minAngularSpeed = 0;
  particleSystem.maxAngularSpeed = Math.PI;

  // Add some randomness to the velocity
  particleSystem.addVelocityGradient(0, 0.7);
  particleSystem.addVelocityGradient(1.0, 0.3);

  particleSystem.start();

  // Emit once then dispose after particles are done
  setTimeout(() => {
    particleSystem.stop();
    setTimeout(() => {
      particleSystem.dispose();
    }, particleSystem.maxLifeTime * 1000);
  }, 50);
}

export function applyCollisionEffects(
  ballMesh: any,
  prevDx: number,
  prevDy: number,
  newDx: number,
  newDy: number,
  color: Color3
) {
  if (!ballMesh) return;

  const collisionType = detectCollision(prevDx, prevDy, newDx, newDy);
  if (!collisionType) return;

  const speed = Math.sqrt(newDx * newDx + newDy * newDy);

  // applyCollisionDeformEffect(ballMesh, collisionType, speed);
  createCollisionLightEffect(ballMesh, collisionType, speed, color);
  createCollisionParticleEffect(ballMesh, collisionType, speed, color, ballMesh.getScene());
}
