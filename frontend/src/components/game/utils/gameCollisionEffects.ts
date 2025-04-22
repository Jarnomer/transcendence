import {
  Animation,
  Color3,
  Color4,
  Mesh,
  MeshBuilder,
  ParticleSystem,
  PointLight,
  Scene,
  Vector3,
} from 'babylonjs';

import { GameSoundManager, RetroEffectsManager, createParticleTexture } from '@game/utils';

function applyPaddleRecoil(paddleMesh: any, speedFactor: number, scene: Scene) {
  if (!paddleMesh) return;

  // Save original position if not already saved
  if (!paddleMesh.originalPosition) {
    paddleMesh.originalPosition = paddleMesh.position.clone();
  }

  const isLeftPaddle = paddleMesh.position.x < 0;
  const recoilDirection = isLeftPaddle ? -1 : 1;
  const recoilDistance = 0.05 * (speedFactor * 5);
  const originalX = paddleMesh.originalPosition.x;

  // Create position animation with keyframes
  const frameRate = 60;
  const recoilAnimation = new Animation(
    'paddleRecoilAnimation',
    'position.x',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  // Define keyframes for the recoil motion
  const keys = [];
  keys.push({ frame: 0, value: originalX });
  keys.push({ frame: 5, value: originalX + recoilDirection * recoilDistance });
  keys.push({ frame: 15, value: originalX - recoilDirection * recoilDistance * 0.2 });
  keys.push({ frame: 30, value: originalX });

  recoilAnimation.setKeys(keys);

  const animationSpeed = Math.max(1, speedFactor * 0.7);

  scene.stopAnimation(paddleMesh, 'position.x');

  scene.beginDirectAnimation(paddleMesh, [recoilAnimation], 0, 30, false, animationSpeed, () => {
    paddleMesh.position.x = originalX;
  });
}

function applySquishEffect(
  ballMesh: any,
  collisionType: 'dx' | 'dy',
  speedFactor: number,
  scene: Scene
) {
  // Save original scale for reference
  if (!ballMesh.originalScale) {
    ballMesh.originalScale = new Vector3(1, 1, 1);
  }

  // Force reset to original scale to prevent compounding deformations
  ballMesh.scaling = ballMesh.originalScale.clone();

  // Create scale animations with keyframes
  const frameRate = 60;
  const squishAnimation = new Animation(
    'squishAnimation',
    'scaling',
    frameRate,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [];
  const squishAmount = 0.25 + speedFactor * 0.15;
  if (collisionType === 'dx') {
    // Horizontal collision (paddles) -> Deform vertically
    keys.push({ frame: 0, value: ballMesh.originalScale.clone() });
    keys.push({
      frame: 5,
      value: new Vector3(1 - squishAmount, 1 + squishAmount, 1),
    });
    keys.push({
      frame: 15,
      value: new Vector3(1 - squishAmount / 2, 1 + squishAmount / 2, 1),
    });
    keys.push({ frame: 30, value: ballMesh.originalScale.clone() });
  } else {
    // Vertical collision (walls) -> Deform horizontally
    keys.push({ frame: 0, value: ballMesh.originalScale.clone() });
    keys.push({
      frame: 5,
      value: new Vector3(1 + squishAmount, 1 - squishAmount, 1),
    });
    keys.push({
      frame: 15,
      value: new Vector3(1 + squishAmount / 2, 1 - squishAmount / 2, 1),
    });
    keys.push({ frame: 30, value: ballMesh.originalScale.clone() });
  }

  squishAnimation.setKeys(keys);

  // Stop any existing animations to prevent conflicts
  scene.stopAnimation(ballMesh);
  ballMesh.animations = [];
  ballMesh.animations.push(squishAnimation);

  // Directly adjust animation speed based on speedFactor
  const animationSpeed = Math.max(1, speedFactor);

  // Add a callback to ensure the restoration of origial scale
  scene.beginDirectAnimation(ballMesh, [squishAnimation], 0, 30, false, animationSpeed, () => {
    ballMesh.scaling = ballMesh.originalScale.clone();
  });
}

function applyLightEffect(
  ballMesh: Mesh,
  collisionType: 'dx' | 'dy',
  speedFactor: number,
  color: Color3,
  scene: Scene
) {
  const lightIntensity = 0.5 * speedFactor ** 5;
  const lightRadius = 0.5 * (speedFactor * 2);

  let lightPosition;
  if (collisionType === 'dx') {
    // For dx collision (hitting left/right paddles)
    const offsetX = Math.sign(ballMesh.position.x) * -0.5;
    lightPosition = new Vector3(
      ballMesh.position.x + offsetX * 0.25,
      ballMesh.position.y,
      ballMesh.position.z
    );
  } else {
    // For dy collision (hitting top/bottom walls)
    const offsetY = Math.sign(ballMesh.position.y) * -0.5;
    lightPosition = new Vector3(
      ballMesh.position.x,
      ballMesh.position.y + offsetY * 0.25,
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
  keys.push({ frame: 5, value: lightIntensity * 2.0 });
  keys.push({ frame: 10, value: lightIntensity * 1.0 });
  keys.push({ frame: 20, value: 0 });

  fadeAnimation.setKeys(keys);
  light.animations.push(fadeAnimation);

  // Play the animation and then dispose of the light
  const animationDuration = 20;
  scene.beginAnimation(light, 0, animationDuration, false, 1, () => {
    light.dispose();
  });
}

function applyParticleEffect(
  ballMesh: Mesh,
  collisionType: 'dx' | 'dy',
  speedFactor: number,
  color: Color3,
  scene: Scene
) {
  const particleSystem = new ParticleSystem('collisionExplosion', 200, scene);

  particleSystem.particleTexture = createParticleTexture(scene, color);

  let emitterPosition;
  if (collisionType === 'dx') {
    // X-direction collision (hitting paddles)
    const xDirection = Math.sign(ballMesh.position.x) * -1;
    emitterPosition = new Vector3(
      ballMesh.position.x + xDirection * 0.25,
      ballMesh.position.y,
      ballMesh.position.z
    );
  } else {
    // Y-direction collision (hitting top/bottom walls)
    const yDirection = Math.sign(ballMesh.position.y) * -1;
    emitterPosition = new Vector3(
      ballMesh.position.x,
      ballMesh.position.y + yDirection * 0.25,
      ballMesh.position.z
    );
  }

  particleSystem.emitter = emitterPosition;

  // Adjust particle velocity manually based on collision direction
  particleSystem.startDirectionFunction = (directionToUpdate: any) => {
    if (collisionType === 'dx') {
      // For dx collisions (hitting paddles), cone directed along x-axis
      const xDirection = Math.sign(ballMesh.position.x) * -1;
      directionToUpdate.x = xDirection;
      directionToUpdate.y = (Math.random() - 0.5) * 1.0; // Small Y variation
      directionToUpdate.z = (Math.random() - 0.5) * 0.5;
    } else {
      // For dy collisions (hitting walls), cone directed along y-axis
      const yDirection = Math.sign(ballMesh.position.y) * -1;
      directionToUpdate.x = (Math.random() - 0.5) * 1.0;
      directionToUpdate.y = yDirection;
      directionToUpdate.z = (Math.random() - 0.5) * 0.5;
    }
  };

  particleSystem.createConeEmitter(1, Math.PI * 1.5);

  particleSystem.color1 = new Color4(color.r, color.g, color.b, 1.0);
  particleSystem.color2 = new Color4(color.r * 1.5, color.g * 1.5, color.b * 1.5, 0.8);
  particleSystem.colorDead = new Color4(color.r * 0.7, color.g * 0.7, color.b * 0.7, 0);

  // Particle properties based on speed factor
  particleSystem.minSize = 0.3 * speedFactor;
  particleSystem.maxSize = 1.2 * speedFactor;
  particleSystem.minLifeTime = 0.3;
  particleSystem.maxLifeTime = 0.6;
  particleSystem.emitRate = 0; // burst manually
  particleSystem.manualEmitCount = 2 * (speedFactor * 1.5);
  particleSystem.minEmitPower = 2 * speedFactor;
  particleSystem.maxEmitPower = 8 * speedFactor;

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  // Add some rotation to the particles
  particleSystem.minAngularSpeed = Math.PI;
  particleSystem.maxAngularSpeed = Math.PI * 4;

  // Dynamic velocity and size gradients
  particleSystem.addVelocityGradient(0, 1.0);
  particleSystem.addVelocityGradient(0.2, 0.8);
  particleSystem.addVelocityGradient(0.5, 0.4);
  particleSystem.addVelocityGradient(1.0, 0.1);
  particleSystem.addSizeGradient(0, 0.7);
  particleSystem.addSizeGradient(0.3, 1.0);
  particleSystem.addSizeGradient(0.7, 0.8);
  particleSystem.addSizeGradient(1.0, 0.1);

  particleSystem.start();

  setTimeout(() => {
    particleSystem.stop();
    setTimeout(() => {
      particleSystem.dispose();
    }, particleSystem.maxLifeTime * 1000);
  }, 300);
}

function applyShockwaveEffect(
  ballMesh: Mesh,
  collisionType: 'dx' | 'dy',
  speedFactor: number,
  color: Color3,
  scene: Scene
) {
  const shockwaveSystem = new ParticleSystem('collisionShockwave', 50, scene);

  shockwaveSystem.particleTexture = createParticleTexture(scene, color);

  let emitterPosition;
  if (collisionType === 'dx') {
    // X-direction collision (hitting left/right paddles)
    const xDirection = Math.sign(ballMesh.position.x) * -1;
    emitterPosition = new Vector3(
      ballMesh.position.x + xDirection * 0.2,
      ballMesh.position.y,
      ballMesh.position.z
    );
  } else {
    // Y-direction collision (hitting top/bottom walls)
    const yDirection = Math.sign(ballMesh.position.y) * -1;
    emitterPosition = new Vector3(
      ballMesh.position.x,
      ballMesh.position.y + yDirection * 0.2,
      ballMesh.position.z
    );
  }

  shockwaveSystem.emitter = emitterPosition;

  if (collisionType === 'dx') {
    // For dx collisions (hitting paddles), create vertical disk
    shockwaveSystem.minEmitBox = new Vector3(0, -0.5, -0.5);
    shockwaveSystem.maxEmitBox = new Vector3(0, 0.5, 0.5);
  } else {
    // For dy collisions (hitting walls), create horizontal disk
    shockwaveSystem.minEmitBox = new Vector3(-0.5, 0, -0.5);
    shockwaveSystem.maxEmitBox = new Vector3(0.5, 0, 0.5);
  }

  // Make hockwave appear brighter than other effects
  shockwaveSystem.color1 = new Color4(color.r * 1.2, color.g * 1.2, color.b * 1.2, 0.7);
  shockwaveSystem.color2 = new Color4(color.r * 1.8, color.g * 1.8, color.b * 1.8, 0.5);
  shockwaveSystem.colorDead = new Color4(color.r, color.g, color.b, 0);

  // Particle properties based on speed factor
  shockwaveSystem.minSize = 0.8 * speedFactor;
  shockwaveSystem.maxSize = 1.6 * speedFactor;
  shockwaveSystem.minLifeTime = 0.2;
  shockwaveSystem.maxLifeTime = 0.4;
  shockwaveSystem.emitRate = 0; // burst manually
  shockwaveSystem.manualEmitCount = 0.5 * (speedFactor / 3);
  shockwaveSystem.minEmitPower = 2 * speedFactor;
  shockwaveSystem.maxEmitPower = 4 * speedFactor;

  shockwaveSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  shockwaveSystem.start();

  setTimeout(() => {
    shockwaveSystem.stop();
    setTimeout(() => {
      shockwaveSystem.dispose();
    }, shockwaveSystem.maxLifeTime * 1000);
  }, 200);

  return shockwaveSystem;
}

function applyEdgeDeformEffect(
  edgeMesh: Mesh,
  ballMesh: Mesh,
  speedFactor: number,
  spinFactor: number,
  scene: Scene
) {
  const deformDirection = edgeMesh.position.y < 0 ? -1 : 1;
  const originalPoints = edgeMesh.metadata.originalPoints;
  const numPoints = originalPoints.length;
  const ballX = ballMesh.position.x;

  const combinedFactor = speedFactor + spinFactor;

  const maxDeform = combinedFactor * 0.2;
  const affectRadius = combinedFactor * 0.5;

  // Create new points array for deformed shape
  const deformedPoints = [];
  for (let i = 0; i < numPoints; i++) {
    const origPoint = originalPoints[i];
    const newPoint = origPoint.clone();

    const distance = Math.abs(origPoint.x - ballX);

    if (distance < affectRadius) {
      // Apply cosine-based deformation for smooth falloff
      const deformFactor = Math.cos(((distance / affectRadius) * Math.PI) / 2);
      newPoint.y += maxDeform * deformFactor * deformDirection;
    }

    deformedPoints.push(newPoint);
  }

  // Apply the deformation immediately
  MeshBuilder.CreateTube(
    'updatedEdge',
    {
      path: deformedPoints,
      radius: 0.15,
      tessellation: 16,
      updatable: true,
      instance: edgeMesh,
    },
    scene
  );

  // Create an animation to restore the original shape
  const frameRate = 60;
  const animation = new Animation(
    'edgeRestoreAnimation',
    'metadata.deformFactor',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  // Store the deformed points for interpolation
  edgeMesh.metadata.deformedPoints = deformedPoints;
  edgeMesh.metadata.deformFactor = 0;

  // Adjust animation to be more springy with higher spin values
  const restoreDuration = Math.max(30, (40 * combinedFactor) / 4);
  const keys = [];
  keys.push({ frame: 0, value: 0 });
  keys.push({ frame: 5, value: 0.2 });
  keys.push({ frame: 15, value: 0.7 });
  keys.push({ frame: restoreDuration, value: 1 });

  animation.setKeys(keys);

  // Function to update the mesh during animation
  const updateMesh = () => {
    const factor = edgeMesh.metadata.deformFactor;

    // Skip if animation hasn't started
    if (factor === undefined) return;

    // Create interpolated points
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const deformedPoint = edgeMesh.metadata.deformedPoints[i];
      const originalPoint = originalPoints[i];

      // Linear interpolation between deformed and original
      const x = deformedPoint.x + (originalPoint.x - deformedPoint.x) * factor;
      const y = deformedPoint.y + (originalPoint.y - deformedPoint.y) * factor;
      const z = deformedPoint.z;

      points.push(new Vector3(x, y, z));
    }

    // Update the tube
    MeshBuilder.CreateTube(
      'updatedEdge',
      {
        path: points,
        radius: 0.15,
        tessellation: 16,
        updatable: true,
        instance: edgeMesh,
      },
      scene
    );
  };

  const observer = scene.onBeforeRenderObservable.add(updateMesh);

  scene.beginDirectAnimation(edgeMesh, [animation], 0, restoreDuration, false, 1, () => {
    scene.onBeforeRenderObservable.remove(observer);

    // Ensure mesh is fully restored to original shape
    MeshBuilder.CreateTube(
      'updatedEdge',
      {
        path: originalPoints,
        radius: 0.15,
        tessellation: 16,
        updatable: true,
        instance: edgeMesh,
      },
      scene
    );
  });
}

export function applyCollisionEffects(
  retroEffectsRef: RetroEffectsManager | null,
  ballMesh: Mesh,
  paddleMesh: Mesh,
  edgeMesh: Mesh,
  collisionType: 'dx' | 'dy',
  speed: number,
  spin: number,
  color: Color3,
  applyGlitch: boolean,
  soundManagerRef?: GameSoundManager | null
) {
  const speedFactor = Math.min(Math.max(speed / 5, 1.5), 4.0);
  const spinFactor = Math.min(Math.max(spin / 5, 1.0), 3.0);
  const combinedFactor = speedFactor + spinFactor;
  const volumeFactor = Math.min(0.5 + combinedFactor * 0.1, 1.2);
  const scene = ballMesh.getScene();

  applySquishEffect(ballMesh, collisionType, speedFactor, scene);
  applyLightEffect(ballMesh, collisionType, speedFactor, color, scene);
  applyShockwaveEffect(ballMesh, collisionType, speedFactor, color, scene);
  applyParticleEffect(ballMesh, collisionType, speedFactor, color, scene);

  if (collisionType === 'dx') {
    applyPaddleRecoil(paddleMesh, speedFactor, scene);
    if (soundManagerRef && applyGlitch) soundManagerRef.playPaddleSound(volumeFactor);
  } else if (collisionType === 'dy') {
    applyEdgeDeformEffect(edgeMesh, ballMesh, speedFactor, spinFactor, scene);
    if (soundManagerRef && applyGlitch) soundManagerRef.playEdgeSound(volumeFactor);
  }

  if (retroEffectsRef && applyGlitch) {
    retroEffectsRef.setGlitchAmount(combinedFactor / 8);
  }
}
