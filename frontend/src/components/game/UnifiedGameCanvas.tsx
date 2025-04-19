import React, { useEffect, useRef, useState } from 'react';

import {
  ArcRotateCamera,
  Animation,
  Color3,
  CubicEase,
  Mesh,
  Color4,
  DefaultRenderingPipeline,
  EasingFunction,
  Engine,
  Scene,
  Vector3,
} from 'babylonjs';

import {
  RetroEffectsManager,
  animateCamera,
  applyBallEffects,
  applyCollisionEffects,
  applyPlayerEffects,
  applyScoreEffects,
  ballSparkEffect,
  cameraAngles,
  createBall,
  createEdge,
  createFloor,
  createPaddle,
  createPongRetroEffects,
  enableRequiredExtensions,
  gameToSceneX,
  gameToSceneY,
  getRandomCameraAngle,
  getThemeColors,
  parseColor,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
  GameSoundManager,
  getGameSoundManager,
} from '@game/utils';

import {
  Ball,
  GameState,
  RetroEffectsLevels,
  defaultCameraTimings,
  defaultGameParams,
  defaultRetroCinematicBaseParams,
  defaultRetroEffectsLevels,
  defaultRetroEffectTimings,
  retroEffectsPresets,
} from '@shared/types';

type GameMode = 'background' | 'active';

interface UnifiedGameCanvasProps {
  gameState: GameState;
  gameMode: GameMode;
  theme?: 'light' | 'dark';
}

const gameplayCameraAngle = {
  position: new Vector3(0, 28, -28),
  target: new Vector3(0, -0.15, 0),
};

const getThemeColorsFromDOM = (theme: 'light' | 'dark' = 'dark') => {
  const computedStyle = getComputedStyle(document.documentElement);
  document.documentElement.setAttribute('data-theme', theme);

  const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
  const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim();
  const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();

  return getThemeColors(theme, primaryColor, secondaryColor, backgroundColor);
};

const detectCollision = (prevDx: number, newDx: number, newY: number): 'dx' | 'dy' | null => {
  const gameHeight = defaultGameParams.dimensions.gameHeight;
  const ballSize = defaultGameParams.ball.size;
  const dxCollision = Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = newY === 0 || newY === gameHeight - ballSize;

  if (dxCollision) return 'dx';
  if (dyCollision) return 'dy';

  return null;
};

const detectScore = (
  player1Score: number,
  player2Score: number,
  lastScoreRef: { value: number },
  ballDx: number
): 'player1' | 'player2' | null => {
  const currentScore = player1Score + player2Score;

  if (currentScore === lastScoreRef.value) return null;

  if (ballDx < 0) {
    lastScoreRef.value = currentScore;
    return 'player2';
  } else {
    lastScoreRef.value = currentScore;
    return 'player1';
  }
};

const applyLowQualitySettings = (scene: Scene, pipeline: DefaultRenderingPipeline | null) => {
  scene.getEngine().setHardwareScalingLevel(2.0);

  scene.shadowsEnabled = true;
  scene.lightsEnabled = true;
  scene.skipFrustumClipping = true;
  scene.skipPointerMovePicking = true;

  if (pipeline) {
    pipeline.bloomEnabled = true;
    pipeline.depthOfFieldEnabled = true;
    pipeline.chromaticAberrationEnabled = true;
    pipeline.grainEnabled = true;
    pipeline.fxaaEnabled = true;
    pipeline.samples = 1;
  }

  // Enable occlusion culling
  scene.autoClear = false;
  scene.autoClearDepthAndStencil = false;
  scene.blockMaterialDirtyMechanism = true;
};

const optimizeShadowGenerators = (shadowGenerators: any[]) => {
  shadowGenerators.forEach((generator) => {
    generator.useBlurExponentialShadowMap = true;
    generator.blurKernel = 8;
    generator.bias = 0.01;
    generator.mapSize = 512;
    generator.forceBackFacesOnly = true;
    generator.usePercentageCloserFiltering = false;
  });
};

const UnifiedGameCanvas: React.FC<UnifiedGameCanvasProps> = ({
  gameState,
  gameMode,
  theme = 'dark',
}) => {
  const prevBallState = useRef({ x: 0, y: 0, dx: 0, dy: 0, spin: 0 });
  const themeColors = useRef<{
    primaryColor: Color3;
    secondaryColor: Color3;
    backgroundColor: Color3;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);

  const soundManagerRef = useRef<GameSoundManager>(null);
  const postProcessingRef = useRef<DefaultRenderingPipeline | null>(null);
  const sparkEffectsRef = useRef<((speed: number, spin: number) => void) | null>(null);
  const retroEffectsRef = useRef<RetroEffectsManager | null>(null);
  const retroLevelsRef = useRef<RetroEffectsLevels>(defaultRetroEffectsLevels);

  const currentAngleIndexRef = useRef<number>(-1);
  const cameraMoveTimerRef = useRef<number | null>(null);
  const randomGlitchTimerRef = useRef<number | null>(null);
  const isAnimatingBallRef = useRef<boolean>(false);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const lastGameModeRef = useRef<GameMode>('background');

  const floorRef = useRef<any>(null);
  const topEdgeRef = useRef<any>(null);
  const bottomEdgeRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const gameHeight = defaultGameParams.dimensions.gameHeight;

  const setupCamera = () => {
    if (!cameraRef.current) return;

    if (cameraMoveTimerRef.current) {
      window.clearInterval(cameraMoveTimerRef.current);
      cameraMoveTimerRef.current = null;
    }

    console.log(`Setting up camera for mode: ${gameMode}`);

    if (gameMode === 'background') {
      const randomAngle = getRandomCameraAngle();
      animateCamera(cameraRef.current, randomAngle);
      currentAngleIndexRef.current = cameraAngles.findIndex((angle) => angle === randomAngle);

      cameraMoveTimerRef.current = window.setInterval(() => {
        if (cameraRef.current) {
          currentAngleIndexRef.current = (currentAngleIndexRef.current + 1) % cameraAngles.length;
          const newAngle = cameraAngles[currentAngleIndexRef.current];
          animateCamera(cameraRef.current, newAngle);

          if (retroEffectsRef.current) {
            retroEffectsRef.current.simulateTrackingDistortion(
              defaultRetroEffectTimings.trackingDistortionIntensity,
              defaultRetroEffectTimings.trackingDistortionIntensity
            );
          }
        }
      }, defaultCameraTimings.cameraMoveInterval);
    } else {
      if (cameraRef.current) {
        animateCamera(cameraRef.current, gameplayCameraAngle);

        if (retroEffectsRef.current) {
          retroEffectsRef.current.simulateTrackingDistortion(
            defaultRetroEffectTimings.trackingDistortionIntensity,
            defaultRetroEffectTimings.trackingDistortionIntensity
          );
        }
      }
    }
  };

  const updateRetroEffects = () => {
    if (!retroEffectsRef.current) return;

    if (gameMode === 'active') {
      // Switch to gameplay effects
      retroEffectsRef.current.updateLevels(retroEffectsPresets.default);
      retroLevelsRef.current = defaultRetroEffectsLevels;
    } else {
      // Switch to background cinematic effects
      retroEffectsRef.current.updateLevels(retroEffectsPresets.cinematic);
      retroLevelsRef.current = retroEffectsPresets.cinematic;
    }
  };

  const animateBallAfterScore = (
    scene: Scene,
    ballMesh: Mesh,
    ballState: Ball,
    camera: ArcRotateCamera,
    scoringPlayer: 'player1' | 'player2'
  ) => {
    if (gameMode !== 'active') return;

    isAnimatingBallRef.current = true;

    const ballX = ballMesh.position.x;
    const ballY = ballMesh.position.y;
    const ballZ = ballMesh.position.z;
    const scaleFactor = defaultGameParams.dimensions.scaleFactor;

    const ballDx = ballState.dx / scaleFactor;
    const ballDy = -ballState.dy / scaleFactor;

    const frameRate = 30;

    const continueStartPos = new Vector3(ballX, ballY, ballZ);
    const continueFinalPos = new Vector3(
      ballX + ballDx * frameRate,
      ballY + ballDy * frameRate,
      ballZ
    );

    const continueAnim = new Animation(
      'ballContinueMovement',
      'position',
      frameRate,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const continueKeys = [
      { frame: 0, value: continueStartPos },
      { frame: frameRate, value: continueFinalPos },
    ];

    continueAnim.setKeys(continueKeys);

    const cameraPos = camera.position.clone();
    const cameraTarget = camera.target.clone();
    const centerX = gameToSceneX(gameWidth / 2, ballMesh);
    const centerY = gameToSceneY(gameHeight / 2, ballMesh);

    const distanceBehindCamera = 8;
    const xOffsetAmount = 3;

    const xOffset = scoringPlayer === 'player1' ? xOffsetAmount : -xOffsetAmount;
    const cameraDirection = cameraPos.subtract(cameraTarget).normalize();
    const dropStartPos = cameraPos.add(cameraDirection.scale(distanceBehindCamera));
    const dropFinalPos = new Vector3(centerX, centerY, ballZ);

    dropStartPos.x = centerX + xOffset;
    dropStartPos.z += 5;

    const dropAnim = new Animation(
      'ballDropAnimation',
      'position',
      frameRate,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const dropKeys = [
      { frame: 0, value: dropStartPos },
      { frame: frameRate, value: dropFinalPos },
    ];

    dropAnim.setKeys(dropKeys);

    const easingFunction = new CubicEase();
    easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
    dropAnim.setEasingFunction(easingFunction);

    // Execute animations in sequence
    ballMesh.animations = [continueAnim];
    scene.beginAnimation(ballMesh, 0, frameRate, false, 1, () => {
      ballMesh.position = dropStartPos;
      ballMesh.animations = [dropAnim];
      scene.beginAnimation(ballMesh, 0, frameRate, false, 1, () => {
        isAnimatingBallRef.current = false;
      });
    });
  };

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    const bgColor = parseColor('#33353e');
    scene.clearColor = new Color4(bgColor.r, bgColor.g, bgColor.b, 1.0);

    const camera = setupSceneCamera(scene);
    const pipeline = setupPostProcessing(scene, camera);

    applyLowQualitySettings(scene, pipeline);
    enableRequiredExtensions(engine);

    const { shadowGenerators } = setupScenelights(scene, primaryColor);
    optimizeShadowGenerators(shadowGenerators);

    floorRef.current = createFloor(scene, backgroundColor);
    topEdgeRef.current = createEdge(scene, primaryColor);
    bottomEdgeRef.current = createEdge(scene, primaryColor);
    player1Ref.current = createPaddle(scene, primaryColor);
    player2Ref.current = createPaddle(scene, primaryColor);
    ballRef.current = createBall(scene, primaryColor);

    const gameObjects = [
      player1Ref.current,
      player2Ref.current,
      ballRef.current,
      topEdgeRef.current,
      bottomEdgeRef.current,
    ];

    setupReflections(scene, floorRef.current, gameObjects);
    shadowGenerators.forEach((generator) => {
      gameObjects.forEach((obj) => {
        generator.addShadowCaster(obj);
      });
    });

    engineRef.current = engine;
    sceneRef.current = scene;
    cameraRef.current = camera;
    themeColors.current = colors;
    postProcessingRef.current = pipeline;
    soundManagerRef.current = getGameSoundManager();

    topEdgeRef.current.position.x = gameToSceneX(0, topEdgeRef.current);
    topEdgeRef.current.position.y = gameToSceneY(-10, topEdgeRef.current);
    bottomEdgeRef.current.position.x = gameToSceneX(0, bottomEdgeRef.current);
    bottomEdgeRef.current.position.y = gameToSceneY(gameHeight + 2, bottomEdgeRef.current);

    lastGameModeRef.current = gameMode;
    retroLevelsRef.current = retroEffectsPresets.cinematic;
    retroEffectsRef.current = createPongRetroEffects(
      scene,
      camera,
      'cinematic',
      retroLevelsRef.current,
      defaultRetroCinematicBaseParams
    );

    sparkEffectsRef.current = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);

    setupCamera();

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (engineRef.current) engineRef.current.renderEvenInBackground = false;
      } else {
        if (engineRef.current) engineRef.current.renderEvenInBackground = true;
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (sparkEffectsRef.current) sparkEffectsRef.current(0, 0);
      if (retroEffectsRef.current) retroEffectsRef.current.dispose();

      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }

      if (randomGlitchTimerRef.current) {
        window.clearTimeout(randomGlitchTimerRef.current);
        randomGlitchTimerRef.current = null;
      }

      engine.dispose();
      scene.dispose();
    };
  }, []);

  // Handle game mode changes
  useEffect(() => {
    if (!cameraRef.current || !retroEffectsRef.current) return;

    if (lastGameModeRef.current !== gameMode) {
      console.log(`Game mode changed from ${lastGameModeRef.current} to ${gameMode}`);

      updateRetroEffects();
      setupCamera();

      lastGameModeRef.current = gameMode;
    }
  }, [gameMode]);

  // Handle game object updates
  useEffect(() => {
    if (!canvasRef.current || !sceneRef.current || !cameraRef.current || !themeColors.current)
      return;

    const { players, ball } = gameState;

    const primaryColor = themeColors.current.primaryColor;
    const secondaryColor = themeColors.current.secondaryColor;

    // Update paddle positions
    player1Ref.current.position.x = gameToSceneX(0, player1Ref.current);
    player1Ref.current.position.y = gameToSceneY(players.player1.y, player1Ref.current);
    player2Ref.current.position.x = gameToSceneX(gameWidth, player2Ref.current);
    player2Ref.current.position.y = gameToSceneY(players.player2.y, player2Ref.current);

    // Only update ball position if not in custom animation
    if (!isAnimatingBallRef.current) {
      ballRef.current.position.x = gameToSceneX(ball.x, ballRef.current);
      ballRef.current.position.y = gameToSceneY(ball.y, ballRef.current);
    }

    // Calculate current speed and angle, detect collision and score
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);
    const collisionType = detectCollision(prevBallState.current.dx, ball.dx, ball.y);

    const scoringPlayer =
      gameMode === 'active'
        ? detectScore(players.player1.score, players.player2.score, lastScoreRef.current, ball.dx)
        : null;

    applyBallEffects(ballRef.current, speed, angle, ball.spin, primaryColor);

    if (sparkEffectsRef.current) sparkEffectsRef.current(speed, ball.spin);

    if (collisionType) {
      const paddleToRecoil = ball.dx > 0 ? player1Ref.current : player2Ref.current;
      const edgeToDeform = ball.dy > 0 ? topEdgeRef.current : bottomEdgeRef.current;
      const applyGlitch = gameMode === 'active' ? true : false;

      applyCollisionEffects(
        retroEffectsRef.current,
        ballRef.current,
        paddleToRecoil,
        edgeToDeform,
        collisionType,
        speed,
        ball.spin,
        primaryColor,
        applyGlitch
      );
    }

    if (gameMode === 'active' && scoringPlayer) {
      const scoringPlayerPaddle =
        scoringPlayer === 'player1' ? player1Ref.current : player2Ref.current;
      const scoredAgainstPaddle =
        scoringPlayer === 'player1' ? player2Ref.current : player1Ref.current;

      animateBallAfterScore(
        sceneRef.current,
        ballRef.current,
        ball,
        cameraRef.current,
        scoringPlayer
      );

      applyScoreEffects(
        retroEffectsRef.current,
        sceneRef.current,
        topEdgeRef.current,
        bottomEdgeRef.current,
        scoringPlayerPaddle,
        scoredAgainstPaddle,
        players[scoringPlayer].score,
        speed,
        players,
        ball,
        primaryColor,
        soundManagerRef.current,
        cameraRef.current
      );
    }

    if (gameMode === 'active') {
      applyPlayerEffects(
        sceneRef.current,
        player1Ref.current,
        player2Ref.current,
        players,
        primaryColor,
        secondaryColor
      );
    }

    prevBallState.current = {
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
      spin: ball.spin,
    };
  }, [gameState]);

  return <canvas ref={canvasRef} className="w-full h-full pointer-events-none bg-[#33353e]" />;
};

export default UnifiedGameCanvas;
