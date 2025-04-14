import {
  Animation,
  MeshBuilder,
  Mesh,
  Color3,
  GlowLayer,
  PBRMaterial,
  Scene,
  Vector3,
} from 'babylonjs';

import { gameToSceneX, gameToSceneY } from '@game/utils';

import { Ball, Player, defaultGameParams, defaultGameObjectParams } from '@shared/types';

export function applyPaddleExplosion(
  scene: Scene,
  paddle: Mesh,
  intensity: number,
  scoringDirection: 'left' | 'right',
  ballY: number,
  paddleY: number,
  paddleHeight: number,
  duration: number = 1000
): void {
  const originalPosition = paddle.position.clone();
  const fragments = createPaddleFragments(scene, paddle, intensity);

  paddle.visibility = 0;

  animateFragments(
    scene,
    fragments,
    paddle,
    intensity,
    scoringDirection,
    ballY,
    paddleY,
    paddleHeight,
    duration
  );

  setTimeout(() => {
    const gameWidth = defaultGameParams.dimensions.gameWidth;
    const x: number = originalPosition.x < 0 ? 0 : gameWidth;
    const y = defaultGameParams.dimensions.gameHeight / 2;

    paddle.visibility = 1;
    paddle.position.x = gameToSceneX(x, paddle);
    paddle.position.y = gameToSceneY(y, paddle);
  }, duration * 0.9); // Show paddle sooner
}

function createPaddleFragments(scene: Scene, paddle: Mesh, intensity: number): Mesh[] {
  const numFragments = Math.min(15 + Math.floor(intensity * 10), 25);

  const paddleWidth = paddle.getBoundingInfo().boundingBox.extendSize.x * 2 * paddle.scaling.x;
  const paddleHeight = paddle.getBoundingInfo().boundingBox.extendSize.y * 2 * paddle.scaling.y;
  const paddleDepth = paddle.getBoundingInfo().boundingBox.extendSize.z * 2 * paddle.scaling.z;

  const fragmentWidth = paddleWidth / 2;
  const fragmentHeight = paddleHeight / 3;
  const fragmentDepth = paddleDepth / 2;

  const originalMaterial = paddle.material as PBRMaterial;

  const fragments: Mesh[] = [];
  for (let i = 0; i < numFragments; i++) {
    // Random position within the paddle boundary
    const offsetX = (Math.random() - 0.5) * paddleWidth * 0.8;
    const offsetY = (Math.random() - 0.5) * paddleHeight * 0.8;
    const offsetZ = (Math.random() - 0.5) * paddleDepth * 0.8;

    const sizeVariation = 0.5 + Math.random() * 0.5;

    // Use boxes for better performance
    const fragment = MeshBuilder.CreateBox(
      `paddleFragment_${i}`,
      {
        width: fragmentWidth * sizeVariation,
        height: fragmentHeight * sizeVariation,
        depth: fragmentDepth * sizeVariation,
      },
      scene
    );

    // Position and rotation of the fragment
    fragment.position = new Vector3(
      paddle.position.x + offsetX,
      paddle.position.y + offsetY,
      paddle.position.z + offsetZ
    );
    fragment.rotation = new Vector3(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );

    const fragMaterial = new PBRMaterial(`fragMat_${i}`, scene);

    // Copy properties from original paddle material
    fragMaterial.albedoColor = originalMaterial.albedoColor.clone();
    fragMaterial.emissiveColor = originalMaterial.emissiveColor.clone();
    fragMaterial.emissiveIntensity = originalMaterial.emissiveIntensity;
    fragMaterial.metallic = originalMaterial.metallic;
    fragMaterial.roughness = originalMaterial.roughness;

    fragMaterial.transparencyMode = PBRMaterial.PBRMATERIAL_ALPHABLEND;

    fragment.material = fragMaterial;
    fragment.receiveShadows = false;

    if (i === 0) {
      // Create single shared glow layer for fragments
      const glowLayer = new GlowLayer(`fragmentsGlowLayer`, scene);
      glowLayer.intensity = 0.4;
      glowLayer.blurKernelSize = 8;
      fragment.metadata = { glowLayer, isFirstFragment: true };
    } else {
      const firstFragment = fragments[0];
      fragment.metadata = {}; // No individual glow layer - Add to shared one
      if (firstFragment && firstFragment.metadata && firstFragment.metadata.glowLayer) {
        firstFragment.metadata.glowLayer.addIncludedOnlyMesh(fragment);
      }
    }

    fragments.push(fragment);
  }

  return fragments;
}

function animateFragments(
  scene: Scene,
  fragments: Mesh[],
  paddle: Mesh,
  intensity: number,
  scoringDirection: 'left' | 'right',
  ballY: number,
  paddleY: number,
  paddleHeight: number,
  duration: number
): void {
  // Calculate direction based on scoring direction
  const xDirectionMultiplier = scoringDirection === 'right' ? -1 : 1;

  // Calculate vertical direction based on ball and paddle positions
  const paddleCenter = paddleY + paddleHeight / 2;
  const verticalBias = (ballY - paddleCenter) / paddleHeight; // -0.5 to 0.5

  // Set floor level for fragment disappearance
  const floorLevel = -10; // Fragments will disappear below this Y coordinate

  // Prepare animation parameters
  const endTime = Date.now() + duration;

  // Calculate cone direction parameters
  // Base angle directly toward the opposing player
  const baseAngle = scoringDirection === 'right' ? Math.PI : 0;
  // Wider cone - 140-degree cone (70 degrees on each side of the base angle)
  const coneAngleRange = Math.PI * 0.8; // 140 degrees in radians

  // Calculate center of direction based on ball position relative to paddle
  const verticalAngleAdjustment = (-verticalBias * Math.PI) / 4; // Up to 45 degrees up or down

  const animationObserver = scene.onBeforeRenderObservable.add(() => {
    const deltaTime = scene.getEngine().getDeltaTime() / 1000;
    const currentTime = Date.now();

    let allFragmentsDisposed = true;

    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];

      // Skip if fragment is already disposed
      if (!fragment || !fragment.metadata) continue;

      if (!fragment.metadata.initialized) {
        // Generate a random angle within the cone
        const horizontalAngle = baseAngle + (Math.random() - 0.5) * coneAngleRange;

        // Calculate fragment index as percentage of total fragments
        const fragmentPercentage = i / fragments.length;

        // Distribute fragments more evenly across the cone
        // Center fragments go more directly toward opposing player
        // Edge fragments have more extreme angles
        const distributedHorizontalAngle =
          baseAngle + (fragmentPercentage * 2 - 1) * (coneAngleRange * 0.9);

        // Adjust vertical angle based on where the ball hit the paddle, with some randomness
        // Use fragmentPercentage to create a fan pattern
        const verticalAngle =
          verticalAngleAdjustment + (fragmentPercentage * 2 - 1) * (Math.PI / 5);

        // Calculate 3D direction from angles
        // Increase X component for more horizontal movement
        const dirX = Math.cos(distributedHorizontalAngle) * Math.cos(verticalAngle) * 3;
        const dirY = Math.sin(verticalAngle);
        const dirZ = Math.sin(distributedHorizontalAngle) * Math.cos(verticalAngle);

        // Create direction vector and normalize
        const direction = new Vector3(dirX, dirY, dirZ).normalize();

        // Scale by speed based on intensity and add some randomness
        // Significantly increase the overall speed
        const speed = (5 + Math.random() * 3) * intensity;

        // Initial velocity with direction applied
        const initialVelocity = direction.scale(speed);

        // Initial angular velocity (rotation)
        const angularVelocity = new Vector3(
          (Math.random() - 0.5) * Math.PI * 2 * intensity,
          (Math.random() - 0.5) * Math.PI * 2 * intensity,
          (Math.random() - 0.5) * Math.PI * 2 * intensity
        );

        fragment.metadata.velocity = initialVelocity;
        fragment.metadata.angularVelocity = angularVelocity;
        fragment.metadata.initialized = true;
        fragment.metadata.lifeTime = 0;
      }

      // Apply velocity and gravity
      fragment.position.x += fragment.metadata.velocity.x * deltaTime;
      fragment.position.y += fragment.metadata.velocity.y * deltaTime;
      fragment.position.z += fragment.metadata.velocity.z * deltaTime;

      // Apply very reduced gravity - much less influence
      fragment.metadata.velocity.y -= 3 * deltaTime;

      // Apply rotation
      fragment.rotation.x += fragment.metadata.angularVelocity.x * deltaTime;
      fragment.rotation.y += fragment.metadata.angularVelocity.y * deltaTime;
      fragment.rotation.z += fragment.metadata.angularVelocity.z * deltaTime;

      // Track lifetime of fragment
      fragment.metadata.lifeTime += deltaTime;

      // Apply fade out after 50% of duration
      if (fragment.metadata.lifeTime > (duration * 0.6) / 1000) {
        const fadeProgress = Math.min(
          (fragment.metadata.lifeTime - (duration * 0.6) / 1000) / ((duration * 0.4) / 1000),
          1
        );
        (fragment.material as PBRMaterial).alpha = Math.max(0, 1 - fadeProgress);
      }

      // Reduced air resistance - fragments keep more of their momentum
      fragment.metadata.velocity.scaleInPlace(0.99);
      fragment.metadata.angularVelocity.scaleInPlace(0.99);

      // Check if fragment is far out of bounds in any direction
      const isOutOfBounds =
        Math.abs(fragment.position.x) > 30 ||
        Math.abs(fragment.position.y) > 20 ||
        Math.abs(fragment.position.z) > 20 ||
        fragment.position.y < floorLevel ||
        (fragment.material as PBRMaterial).alpha <= 0.05;

      if (isOutOfBounds) {
        // Dispose material and fragment
        if (fragment.material) {
          fragment.material.dispose();
        }

        // Only dispose the shared glow layer when the first fragment is disposed
        if (fragment.metadata.isFirstFragment && fragment.metadata.glowLayer) {
          fragment.metadata.glowLayer.dispose();
        }

        fragment.dispose();
        fragments[i] = null;
      } else {
        allFragmentsDisposed = false; // At least one fragment is still active
      }
    }

    // If all fragments are disposed or time is up, show the paddle again and clean up
    if (allFragmentsDisposed || currentTime >= endTime) {
      // Restore paddle visibility
      paddle.visibility = 1;

      // Remove the animation observer
      scene.onBeforeRenderObservable.remove(animationObserver);

      // Clean up any remaining fragments
      for (let i = 0; i < fragments.length; i++) {
        if (fragments[i]) {
          if (fragments[i].material) {
            fragments[i].material.dispose();
          }
          fragments[i].dispose();
        }
      }
    }
  });

  setTimeout(() => {
    const gameWidth = defaultGameParams.dimensions.gameWidth;
    const x: number = xDirectionMultiplier === -1 ? 0 : gameWidth;
    const y = defaultGameParams.dimensions.gameHeight / 2;

    paddle.visibility = 1;
    paddle.position.x = gameToSceneX(x, paddle);
    paddle.position.y = gameToSceneY(y, paddle);

    scene.onBeforeRenderObservable.remove(animationObserver);
  }, duration);
}

export function applyNeonEdgeFlicker(
  scene: Scene,
  topEdgeMesh: Mesh,
  bottomEdgeMesh: Mesh,
  playerColor: Color3,
  effectIntensity: number,
  duration: number = 1500
): void {
  const edgeMaterial = topEdgeMesh.material as PBRMaterial;
  const originalEmissiveColor = edgeMaterial.emissiveColor.clone();
  const originalEmissiveIntensity = edgeMaterial.emissiveIntensity;

  const tempGlowLayer = new GlowLayer('scoreGlowLayer', scene);
  tempGlowLayer.intensity = 0;
  tempGlowLayer.blurKernelSize = 16;
  tempGlowLayer.addIncludedOnlyMesh(topEdgeMesh);
  tempGlowLayer.addIncludedOnlyMesh(bottomEdgeMesh);

  const frameRate = 60;
  const frameCount = frameRate * (duration / 1000);

  const glowAnimation = new Animation(
    'glowAnimation',
    'intensity',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const topEmissiveAnimation = new Animation(
    'topEmissiveAnimation',
    'emissiveIntensity',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  const bottomEmissiveAnimation = new Animation(
    'bottomEmissiveAnimation',
    'emissiveIntensity',
    frameRate,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  const topColorAnimation = new Animation(
    'topColorAnimation',
    'emissiveColor',
    frameRate,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );
  const bottomColorAnimation = new Animation(
    'bottomColorAnimation',
    'emissiveColor',
    frameRate,
    Animation.ANIMATIONTYPE_COLOR3,
    Animation.ANIMATIONLOOPMODE_CYCLE
  );

  // More flickers with higher intensity
  const numFlickers = Math.floor(15 + effectIntensity * 15);

  const topKeyframes = [];
  const bottomKeyframes = [];
  const topColorKeyframes = [];
  const bottomColorKeyframes = [];

  // Generate all of the flickering patterns
  for (let i = 0; i <= numFlickers; i++) {
    const frame = (i / numFlickers) * frameCount;

    // Use random seed factor with small variation
    const randomFactor = Math.random() * 2 - 0.5;
    const topRandomFactor = randomFactor + (Math.random() * 0.5 - 0.25);
    const bottomRandomFactor = randomFactor + (Math.random() * 0.5 - 0.25);

    // Calculate flicker intensities with natural sine wave pattern and randomness
    let topFlickerIntensity =
      3 + Math.sin(i * (0.5 + effectIntensity)) * 3 * effectIntensity * topRandomFactor;
    let bottomFlickerIntensity =
      3 + Math.sin(i * (0.5 + effectIntensity)) * 3 * effectIntensity * bottomRandomFactor;

    const baseIntensity = effectIntensity * 2;
    topFlickerIntensity += baseIntensity;
    bottomFlickerIntensity += baseIntensity;

    topKeyframes.push({ frame, value: topFlickerIntensity });
    bottomKeyframes.push({ frame, value: bottomFlickerIntensity });

    const topColorMultiplier = 0.1 + Math.random() * 0.3;
    const topAnimatedColor = new Color3(
      Math.min(playerColor.r * topColorMultiplier, 1),
      Math.min(playerColor.g * topColorMultiplier, 1),
      Math.min(playerColor.b * topColorMultiplier, 1)
    );

    const bottomColorMultiplier = 0.1 + Math.random() * 0.3;
    const bottomAnimatedColor = new Color3(
      Math.min(playerColor.r * bottomColorMultiplier, 1),
      Math.min(playerColor.g * bottomColorMultiplier, 1),
      Math.min(playerColor.b * bottomColorMultiplier, 1)
    );

    topColorKeyframes.push({ frame, value: topAnimatedColor });
    bottomColorKeyframes.push({ frame, value: bottomAnimatedColor });
  }

  // Add final keyframes to return to original
  topKeyframes.push({ frame: frameCount, value: originalEmissiveIntensity });
  bottomKeyframes.push({ frame: frameCount, value: originalEmissiveIntensity });
  topColorKeyframes.push({ frame: frameCount, value: originalEmissiveColor });
  bottomColorKeyframes.push({ frame: frameCount, value: originalEmissiveColor });

  topEmissiveAnimation.setKeys(topKeyframes);
  bottomEmissiveAnimation.setKeys(bottomKeyframes);
  topColorAnimation.setKeys(topColorKeyframes);
  bottomColorAnimation.setKeys(bottomColorKeyframes);

  const topMaterial = topEdgeMesh.material as PBRMaterial;
  const bottomMaterial = bottomEdgeMesh.material as PBRMaterial;
  topMaterial.animations = [topEmissiveAnimation, topColorAnimation];
  bottomMaterial.animations = [bottomEmissiveAnimation, bottomColorAnimation];

  const glowKeyframes = [];
  for (let i = 0; i <= numFlickers; i++) {
    const frame = (i / numFlickers) * frameCount;
    const baseIntensity = 0.5 + effectIntensity;
    const randomFactor = Math.random() * 0.5;

    const flickerIntensity =
      baseIntensity + Math.sin(i * (0.5 + effectIntensity)) * effectIntensity * randomFactor;

    glowKeyframes.push({ frame, value: flickerIntensity });
  }

  // Add final keyframe to return to original
  glowKeyframes.push({ frame: frameCount, value: 0 });
  glowAnimation.setKeys(glowKeyframes);

  scene.beginAnimation(topMaterial, 0, frameCount, false);
  scene.beginAnimation(bottomMaterial, 0, frameCount, false);
  scene.beginDirectAnimation(tempGlowLayer, [glowAnimation], 0, frameCount, false);

  setTimeout(() => {
    topMaterial.emissiveColor = originalEmissiveColor;
    topMaterial.emissiveIntensity = originalEmissiveIntensity;
    bottomMaterial.emissiveColor = originalEmissiveColor;
    bottomMaterial.emissiveIntensity = originalEmissiveIntensity;
    tempGlowLayer.dispose();
  }, duration);
}

function calculateScoreEffectIntensity(
  playerScore: number,
  ballSpeed: number,
  ballSpin: number
): number {
  // Base intensity from player's current score (0.1 to 0.3)
  const maxScore = defaultGameParams.rules.maxScore;
  const scoreIntensity = Math.min(0.1 + (playerScore / maxScore) * 0.3, 0.3);

  // Add intensity based on how close the game is to ending (0.1 to 0.3)
  const remainingPoints = maxScore - playerScore;
  const endgameIntensity = Math.max(0.1, 0.3 * (1 - remainingPoints / maxScore));

  // Add intensity based on ball physics (0 to 0.4)
  const normalizedSpeed = Math.min(Math.max(ballSpeed / 15, 0), 1);
  const normalizedSpin = Math.min(Math.abs(ballSpin) / 10, 1);
  const physicsIntensity = normalizedSpeed * 0.2 + normalizedSpin * 0.2;

  // Return combined factor (ensure result is between 0.1 and 1.0)
  return Math.min(scoreIntensity + endgameIntensity + physicsIntensity, 1.0);
}

export function applyScoreEffects(
  retroEffectsRef: any,
  scene: Scene,
  topEdge: Mesh,
  bottomEdge: Mesh,
  scoringPlayerPaddle: Mesh,
  scoredAgainstPaddle: Mesh,
  playerScore: number,
  players: { player1: Player; player2: Player },
  ball: Ball,
  primaryColor: Color3
) {
  if (retroEffectsRef) {
    setTimeout(() => {
      retroEffectsRef?.changeChannel(1200).then(() => {});
    }, 300);
  }

  const ballSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
  const ballDirection: 'left' | 'right' = ball.dx > 0 ? 'right' : 'left';
  const intensity = calculateScoreEffectIntensity(playerScore, ballSpeed, ball.spin);

  applyNeonEdgeFlicker(scene, topEdge, bottomEdge, primaryColor, intensity);

  if (scene && scoredAgainstPaddle && players) {
    const scoredAgainstPlayer = ballDirection === 'right' ? 'player1' : 'player2';
    const paddleY = players[scoredAgainstPlayer].y;
    const paddleHeight = players[scoredAgainstPlayer].paddleHeight;

    applyPaddleExplosion(
      scene,
      scoredAgainstPaddle,
      intensity,
      ballDirection,
      ball.y,
      paddleY,
      paddleHeight
    );
  }
}

/*
function createExplosionParticles(
  scene: Scene,
  paddle: Mesh,
  intensity: number,
  scoringDirection: 'left' | 'right'
): void {
  const particleSystem = new ParticleSystem("paddleExplosionParticles", 100, scene);

  // Use a particle texture that looks like a small light burst
  particleSystem.particleTexture = new Texture("/textures/flare.png", scene);

  // Set emitter at paddle position
  particleSystem.emitter = paddle.position.clone();

  // Get color from paddle material
  const paddleMaterial = paddle.material as PBRMaterial;
  const particleColor = paddleMaterial.emissiveColor.clone();

  // Particle colors
  particleSystem.color1 = new Color4(particleColor.r, particleColor.g, particleColor.b, 1.0);
  particleSystem.color2 = new Color4(1, 1, 1, 1.0);
  particleSystem.colorDead = new Color4(particleColor.r * 0.5, particleColor.g * 0.5, particleColor.b * 0.5, 0);

  // Set emission properties
  particleSystem.minEmitBox = new Vector3(-1, -1, -1);
  particleSystem.maxEmitBox = new Vector3(1, 1, 1);

  // Size of each particle
  particleSystem.minSize = 0.1;
  particleSystem.maxSize = 0.5;

  // Emission rate and lifetime
  particleSystem.emitRate = 0; // We'll emit all at once
  particleSystem.manualEmitCount = 50 + Math.floor(intensity * 50);
  particleSystem.minLifeTime = 0.2;
  particleSystem.maxLifeTime = 0.5;

  // Emission power
  const directionMultiplier = scoringDirection === 'right' ? -1 : 1;
  particleSystem.direction1 = new Vector3(directionMultiplier * 5, 5, 5);
  particleSystem.direction2 = new Vector3(directionMultiplier * 5, -5, -5);
  particleSystem.minEmitPower = 5;
  particleSystem.maxEmitPower = 15;

  // Blending mode for glow effect
  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  // Start the effect
  particleSystem.start();

  // Dispose after effect completes
  setTimeout(() => {
    particleSystem.dispose();
  }, 1000);
}
*/
