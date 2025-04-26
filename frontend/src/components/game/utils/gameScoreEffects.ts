import {
  Animation,
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  GlowLayer,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  ParticleSystem,
  Scene,
  Texture,
  Vector3,
} from 'babylonjs';

import {
  GameSoundManager,
  RetroEffectsManager,
  animateBallAfterScore,
  animatePaddleAfterScore,
  applyCameraShake,
  createParticleTexture,
  gameToSceneX,
  gameToSceneY,
} from '@game/utils';

import {
  Ball,
  ScoreEffectTimings,
  defaultGameParams,
  defaultScoreEffectTimings,
} from '@shared/types';

function applyLightEffect(
  scene: Scene,
  intensity: number,
  scoringDirection: 'left' | 'right',
  color: Color3,
  effectDelay: number
): void {
  setTimeout(() => {
    const direction = new Vector3(scoringDirection === 'right' ? -1 : 1, 0, -0.5).normalize();
    const light = new DirectionalLight('scoreDirectionalLight', direction, scene);

    light.diffuse = color.clone().scale(1.5);
    light.specular = color.clone().scale(2.0);
    light.intensity = 0;

    const frameRate = 60;
    const maxIntensity = 1000 * intensity;

    const lightAnimation = new Animation(
      'lightIntensityAnimation',
      'intensity',
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const keys = [
      { frame: 0, value: 0 },
      { frame: 5, value: maxIntensity },
      { frame: 10, value: maxIntensity * 0.8 },
      { frame: 15, value: maxIntensity * 0.6 },
      { frame: 30, value: 0 },
    ];

    lightAnimation.setKeys(keys);

    scene.beginDirectAnimation(light, [lightAnimation], 0, 30, false, 1, () => {
      light.dispose();
    });

    const secondaryDirection = new Vector3(
      scoringDirection === 'right' ? 0.5 : -0.5,
      0.2,
      0.3
    ).normalize();

    const secondaryLight = new DirectionalLight('scoreSecondaryLight', secondaryDirection, scene);

    secondaryLight.diffuse = color.clone().scale(0.5);
    secondaryLight.specular = color.clone().scale(0.7);
    secondaryLight.intensity = 0;

    const secondaryAnimation = new Animation(
      'secondaryLightAnimation',
      'intensity',
      frameRate,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );
    const secondaryKeys = [
      { frame: 0, value: 0 },
      { frame: 10, value: maxIntensity * 0.8 },
      { frame: 15, value: maxIntensity * 0.5 },
      { frame: 40, value: 0 },
    ];

    secondaryAnimation.setKeys(secondaryKeys);

    scene.beginDirectAnimation(secondaryLight, [secondaryAnimation], 0, 40, false, 1, () => {
      secondaryLight.dispose();
    });
  }, effectDelay);
}

function applyBallParticles(
  scene: Scene,
  paddle: Mesh,
  intensity: number,
  scoringDirection: 'left' | 'right',
  ball: Ball,
  effectDelay: number,
  primaryColor: Color3,
  scoreEffectTimings: ScoreEffectTimings = defaultScoreEffectTimings
): void {
  const duration = scoreEffectTimings.scoreBallExplosionDuration;
  const ballSceneX = gameToSceneX(ball.x, paddle);
  const ballSceneY = gameToSceneY(ball.y, paddle);
  const xOffset = scoringDirection === 'right' ? 3.5 : -3.5;

  const particleSystem = new ParticleSystem('ballExplosionParticles', 150, scene);

  particleSystem.particleTexture = createParticleTexture(scene, primaryColor);
  particleSystem.emitter = new Vector3(ballSceneX + xOffset, ballSceneY, paddle.position.z);

  particleSystem.color1 = new Color4(primaryColor.r, primaryColor.g, primaryColor.b, 1.0);
  particleSystem.color2 = new Color4(1, 1, 1, 1.0);
  particleSystem.colorDead = new Color4(
    primaryColor.r * 0.5,
    primaryColor.g * 0.5,
    primaryColor.b * 0.5,
    0
  );

  particleSystem.minSize = 0.2 + intensity * 0.5;
  particleSystem.maxSize = 0.8 + intensity * 1.5;
  particleSystem.minLifeTime = 1.5 + intensity * 1.5;
  particleSystem.maxLifeTime = 3.0 + intensity * 2.0;
  particleSystem.minEmitPower = 2 + intensity * 2.0;
  particleSystem.maxEmitPower = 6 + intensity * 4.0;

  particleSystem.manualEmitCount = 100 + Math.floor(intensity * 100);
  particleSystem.emitRate = 0; // Emit all at once

  particleSystem.minEmitBox = new Vector3(-0.5, -0.5, -0.5);
  particleSystem.maxEmitBox = new Vector3(0.5, 0.5, 0.5);
  particleSystem.direction1 = new Vector3(5, 5, 5);
  particleSystem.direction2 = new Vector3(-5, -5, -5);

  particleSystem.minAngularSpeed = -3.0;
  particleSystem.maxAngularSpeed = 3.0;

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  setTimeout(() => {
    particleSystem.start();
    setTimeout(() => {
      particleSystem.dispose();
    }, duration);
  }, effectDelay);
}

function createParticleFlares(
  scene: Scene,
  paddle: Mesh,
  intensity: number,
  scoringDirection: 'left' | 'right',
  ball: Ball,
  effectDelay: number,
  scoreEffectTimings: ScoreEffectTimings = defaultScoreEffectTimings
): void {
  const duration = scoreEffectTimings.scoreBallExplosionDuration;
  const ballSceneX = gameToSceneX(ball.x, paddle);
  const ballSceneY = gameToSceneY(ball.y, paddle);
  const xOffset = scoringDirection === 'right' ? 3.5 : -3.5;

  const particleSystem = new ParticleSystem('whiteFlareParticles', 100, scene);

  particleSystem.particleTexture = new Texture('/textures/flare.png', scene);
  particleSystem.emitter = new Vector3(ballSceneX + xOffset, ballSceneY, paddle.position.z);

  particleSystem.color1 = new Color4(1, 1, 1, 1.0);
  particleSystem.color2 = new Color4(1, 1, 1, 1.0);
  particleSystem.colorDead = new Color4(0.8, 0.8, 0.8, 0);

  particleSystem.minSize = (0.2 + intensity * 0.5) * (2 / 3);
  particleSystem.maxSize = (0.8 + intensity * 1.5) * (2 / 3);
  particleSystem.minLifeTime = (1.5 + intensity * 1.5) * (2 / 3);
  particleSystem.maxLifeTime = (3.0 + intensity * 2.0) * (2 / 3);
  particleSystem.minEmitPower = (2 + intensity * 2.0) * (2 / 3);
  particleSystem.maxEmitPower = (6 + intensity * 4.0) * (2 / 3);

  particleSystem.manualEmitCount = Math.floor((100 + Math.floor(intensity * 100)) * (2 / 3));
  particleSystem.emitRate = 0; // Emit all at once

  particleSystem.minEmitBox = new Vector3(-0.5, -0.5, -0.5);
  particleSystem.maxEmitBox = new Vector3(0.5, 0.5, 0.5);
  particleSystem.direction1 = new Vector3(5, 5, 5);
  particleSystem.direction2 = new Vector3(-5, -5, -5);

  particleSystem.minAngularSpeed = -3.0 * (2 / 3);
  particleSystem.maxAngularSpeed = 3.0 * (2 / 3);

  particleSystem.blendMode = ParticleSystem.BLENDMODE_ADD;

  setTimeout(() => {
    particleSystem.start();
    setTimeout(() => {
      particleSystem.dispose();
    }, duration);
  }, effectDelay);
}

export function applyPaddleExplosion(
  scene: Scene,
  paddle: Mesh,
  intensity: number,
  scoringDirection: 'left' | 'right',
  ballY: number,
  effectDelay: number,
  camera: ArcRotateCamera | null | undefined,
  scoreEffectTimings: ScoreEffectTimings = defaultScoreEffectTimings
): void {
  const duration = scoreEffectTimings.scorePaddleExplosionDuration;
  setTimeout(() => {
    paddle.visibility = 0;
    const fragments = createPaddleFragments(scene, paddle, intensity);
    animatePaddleFragments(scene, fragments, paddle, intensity, scoringDirection, ballY);
  }, effectDelay);

  setTimeout(() => {
    if (camera) {
      animatePaddleAfterScore(
        scene,
        paddle,
        camera,
        scoringDirection,
        defaultGameParams.dimensions.gameWidth,
        defaultGameParams.dimensions.gameHeight
      );
    }
  }, duration);
}

function createPaddleFragments(scene: Scene, paddle: Mesh, intensity: number): Mesh[] {
  const numFragments = Math.min(25 + Math.floor(intensity * 15), 40);

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

function animatePaddleFragments(
  scene: Scene,
  fragments: Mesh[],
  paddle: Mesh,
  effectIntensity: number,
  scoringDirection: 'left' | 'right',
  ballY: number,
  scoreEffectTimings: ScoreEffectTimings = defaultScoreEffectTimings
): void {
  const duration = scoreEffectTimings.scorePaddleExplosionDuration;
  const ballAbovePaddle = ballY < defaultGameParams.dimensions.gameHeight / 2;
  const baseDirection = scoringDirection === 'right' ? Math.PI : 0;

  const coneTilt = ballAbovePaddle ? -Math.PI / 6 : Math.PI / 6; // 30 degrees
  const coneAngleRange = (Math.PI * 150) / 180; // 150 degrees

  const endTime = Date.now() + duration;
  const animationObserver = scene.onBeforeRenderObservable.add(() => {
    const deltaTime = scene.getEngine().getDeltaTime() / 1000;
    const currentTime = Date.now();
    const timeRemaining = endTime - currentTime;
    const animationProgress = 1 - timeRemaining / duration;

    if (timeRemaining <= 0) {
      // Dispose all fragments and stop the animation if time is up
      for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[i];
        if (fragment) {
          // Only dispose the shared glow layer when the first fragment is disposed
          if (fragment.metadata?.isFirstFragment && fragment.metadata?.glowLayer) {
            fragment.metadata.glowLayer.dispose();
          }

          if (fragment.material) fragment.material.dispose();

          fragment.dispose();
          fragments[i] = null as unknown as Mesh;
        }
      }

      const gameWidth = defaultGameParams.dimensions.gameWidth;
      const x = scoringDirection === 'right' ? 0 : gameWidth;
      const y = defaultGameParams.dimensions.gameHeight / 2;

      paddle.visibility = 1;
      paddle.position.x = gameToSceneX(x, paddle);
      paddle.position.y = gameToSceneY(y, paddle);

      scene.onBeforeRenderObservable.remove(animationObserver);
      return;
    }

    // Process fragment animations
    for (let i = 0; i < fragments.length; i++) {
      const fragment = fragments[i];

      // Skip if fragment is already disposed
      if (!fragment || !fragment.metadata) continue;

      if (!fragment.metadata.initialized) {
        const fragmentPercentage = i / fragments.length;
        const conePosition = fragmentPercentage * 2 - 1;

        const horizontalAngle = baseDirection + conePosition * (coneAngleRange / 2);
        const verticalAngle = coneTilt;

        const xVariabilityFactor = 0.5 + Math.random() * 5.5;
        const yVariabilityFactor = 0.5 + Math.random() * 5.5;
        const zVariabilityFactor = 0.5 + Math.random() * 1.5;

        // Calculate 3D direction from angles
        const dirX = Math.cos(horizontalAngle) * Math.cos(verticalAngle) * xVariabilityFactor;
        const dirY = Math.sin(verticalAngle) * yVariabilityFactor;
        const dirZ = Math.sin(horizontalAngle) * Math.cos(verticalAngle) * zVariabilityFactor;

        // Normalize to ensure consistent direction regardless of magnitude
        const direction = new Vector3(dirX, dirY, dirZ).normalize();

        const speed = (5 + Math.random() * 3) * effectIntensity * 3;
        const initialVelocity = direction.scale(speed);
        const angularVelocity = new Vector3(
          (Math.random() - 0.5) * Math.PI * 2 * effectIntensity,
          (Math.random() - 0.5) * Math.PI * 2 * effectIntensity,
          (Math.random() - 0.5) * Math.PI * 2 * effectIntensity
        );

        fragment.metadata.velocity = initialVelocity;
        fragment.metadata.angularVelocity = angularVelocity;
        fragment.metadata.initialized = true;
        fragment.metadata.lifeTime = 0;
        fragment.metadata.initialSpeed = speed;
      }

      fragment.position.x += fragment.metadata.velocity.x * deltaTime * 1.5;
      fragment.position.y += fragment.metadata.velocity.y * deltaTime;
      fragment.position.z += fragment.metadata.velocity.z * deltaTime;

      fragment.rotation.x += fragment.metadata.angularVelocity.x * deltaTime;
      fragment.rotation.y += fragment.metadata.angularVelocity.y * deltaTime;
      fragment.rotation.z += fragment.metadata.angularVelocity.z * deltaTime;

      fragment.metadata.lifeTime += deltaTime; // Track lifetime of fragment

      const fadeProgressPhase = scoreEffectTimings.fadeStartPaddleMultiplier;
      const timeRatio = timeRemaining / duration;

      const gravity = 9.8 * effectIntensity * Math.min(1.0, animationProgress * 2);
      fragment.metadata.velocity.x += gravity * deltaTime;

      if (timeRatio < fadeProgressPhase) {
        const fadeProgress = Math.min((fadeProgressPhase - timeRatio) / fadeProgressPhase, 1);
        const material = fragment.material as PBRMaterial;
        if (material) material.alpha = Math.max(0, 1 - fadeProgress);
      }

      const angularDrag = 0.98 - animationProgress * 0.1;
      fragment.metadata.angularVelocity.scaleInPlace(angularDrag);
    }
  });
}

export function applyNeonEdgeFlicker(
  scene: Scene,
  topEdgeMesh: Mesh,
  bottomEdgeMesh: Mesh,
  playerColor: Color3,
  effectIntensity: number,
  scoreEffectTimings: ScoreEffectTimings = defaultScoreEffectTimings
): void {
  const duration = scoreEffectTimings.edgeFlickerDuration;
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
  const numFlickers = Math.floor(20 + effectIntensity * 20);

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

function calculateScoreEffectDelay(ballSpeed: number): number {
  const minDelay = 200;
  const maxDelay = 400;
  const normalizedSpeed = Math.min(Math.max(ballSpeed / 15, 0), 1);
  const delay = maxDelay - normalizedSpeed * (maxDelay - minDelay);

  return delay;
}

function calculateScoreEffectIntensity(
  playerScore: number,
  ballSpeed: number,
  ballSpin: number
): number {
  const baseIntensity = 0.5;

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

  return Math.min(baseIntensity + scoreIntensity + endgameIntensity + physicsIntensity, 2.0);
}

export function applySoundEffects(
  effectDelay: number,
  soundManagerRef?: GameSoundManager | null | undefined,
  scoreEffectTimings: ScoreEffectTimings = defaultScoreEffectTimings
): void {
  if (!soundManagerRef) return;

  setTimeout(() => {
    soundManagerRef.playScoreSound();
  }, effectDelay + scoreEffectTimings.scoreSoundDelay);

  setTimeout(() => {
    soundManagerRef.playPaddleFizzleSound();
  }, scoreEffectTimings.paddleFizzleSoundDelay);

  setTimeout(() => {
    soundManagerRef.playBallFizzleSound();
  }, scoreEffectTimings.ballFizzleSoundDelay);
}

export function applyScoreEffects(
  retroEffectsRef: RetroEffectsManager | null | undefined,
  scene: Scene,
  camera: ArcRotateCamera | null | undefined,
  topEdge: Mesh,
  bottomEdge: Mesh,
  scoringPlayerPaddle: Mesh,
  scoredAgainstPaddle: Mesh,
  ballMesh: Mesh,
  playerScore: number,
  ballSpeed: number,
  ball: Ball,
  primaryColor: Color3,
  gameWidth: number = defaultGameParams.dimensions.gameWidth,
  gameHeight: number = defaultGameParams.dimensions.gameHeight,
  onAnimationComplete?: () => void,
  soundManagerRef?: GameSoundManager | null | undefined,
  scoreEffectTimings: ScoreEffectTimings = defaultScoreEffectTimings
) {
  const ballDirection: 'left' | 'right' = ball.dx > 0 ? 'right' : 'left';
  const scoringPlayer: 'player1' | 'player2' = ballDirection === 'right' ? 'player2' : 'player1';
  const intensityFactor = calculateScoreEffectIntensity(playerScore, ballSpeed, ball.spin);
  const effectDelay = calculateScoreEffectDelay(ballSpeed);

  applyLightEffect(scene, intensityFactor, ballDirection, primaryColor, effectDelay);

  applySoundEffects(effectDelay, soundManagerRef, scoreEffectTimings);

  if (camera) {
    animateBallAfterScore(
      scene,
      ballMesh,
      ball,
      camera,
      scoringPlayer,
      gameWidth,
      gameHeight,
      defaultGameParams.dimensions.scaleFactor,
      onAnimationComplete
    );
  }

  applyNeonEdgeFlicker(
    scene,
    topEdge,
    bottomEdge,
    primaryColor,
    intensityFactor,
    scoreEffectTimings
  );

  applyPaddleExplosion(
    scene,
    scoredAgainstPaddle,
    intensityFactor,
    ballDirection,
    ball.y,
    effectDelay,
    camera,
    scoreEffectTimings
  );

  applyBallParticles(
    scene,
    scoredAgainstPaddle,
    intensityFactor,
    ballDirection,
    ball,
    effectDelay,
    primaryColor,
    scoreEffectTimings
  );

  createParticleFlares(
    scene,
    scoredAgainstPaddle,
    intensityFactor,
    ballDirection,
    ball,
    effectDelay,
    scoreEffectTimings
  );

  if (camera) {
    const shakeIntensity = 0.5 + intensityFactor * 1.0;
    const shakeDuration = 300 + intensityFactor * 500;
    applyCameraShake(scene, camera, shakeIntensity, effectDelay, shakeDuration);
  }

  if (retroEffectsRef) {
    setTimeout(() => {
      retroEffectsRef.simulateTrackingDistortion(intensityFactor);
    }, effectDelay);
  }
}
