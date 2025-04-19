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
  applyCameraAngle,
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
  PowerUp,
  RetroEffectsLevels,
  defaultCameraTimings,
  defaultCinematicGlitchTimings,
  defaultGameParams,
  defaultRetroCinematicBaseParams,
  defaultRetroEffectTimings,
  defaultRetroEffectsLevels,
  defaultRetroEffectsBaseParams,
  retroEffectsPresets,
} from '@shared/types';

type GameMode = 'background' | 'active';

interface UnifiedGameCanvasProps {
  gameState: GameState;
  isVisible: boolean;
  gameMode: GameMode;
  theme?: 'light' | 'dark';
  onTransitionComplete?: (toMode: GameMode) => void;
}

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
  isVisible,
  gameMode,
  theme = 'dark',
  onTransitionComplete,
}) => {
  const [lastGameMode, setLastGameMode] = useState<GameMode>(gameMode);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
  const prevPowerUpsRef = useRef<PowerUp[]>([]);

  const floorRef = useRef<any>(null);
  const topEdgeRef = useRef<any>(null);
  const bottomEdgeRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const gameHeight = defaultGameParams.dimensions.gameHeight;

  // Setup render loop based on game mode
  const setupRenderLoop = () => {
    if (!engineRef.current || !sceneRef.current) return;

    engineRef.current.stopRenderLoop();

    if (gameMode === 'background') {
      // Background mode: 30fps throttled render loop
      const interval = 1000 / 30;
      let lastTime = 0;

      engineRef.current.runRenderLoop(() => {
        const currentTime = performance.now();
        if (currentTime - lastTime >= interval) {
          lastTime = currentTime;
          sceneRef.current?.render();
        }
      });
    } else {
      // Active game mode: Full 60fps render loop
      engineRef.current.runRenderLoop(() => {
        sceneRef.current?.render();
      });
    }
  };

  // Handle camera management based on game mode
  const setupCamera = () => {
    if (!cameraRef.current) return;

    // Clear any existing camera timer
    if (cameraMoveTimerRef.current) {
      window.clearInterval(cameraMoveTimerRef.current);
      cameraMoveTimerRef.current = null;
    }

    if (gameMode === 'background') {
      // Background mode: Rotating cinematic camera
      const randomAngle = getRandomCameraAngle();
      applyCameraAngle(cameraRef.current, randomAngle, postProcessingRef.current);
      currentAngleIndexRef.current = cameraAngles.findIndex((angle) => angle === randomAngle);

      cameraMoveTimerRef.current = window.setInterval(() => {
        if (cameraRef.current) {
          currentAngleIndexRef.current = (currentAngleIndexRef.current + 1) % cameraAngles.length;
          const newAngle = cameraAngles[currentAngleIndexRef.current];
          animateCamera(cameraRef.current, newAngle);

          if (retroEffectsRef.current) {
            retroEffectsRef.current.simulateTrackingDistortion(
              defaultRetroEffectTimings.trackingDistortionIntensity,
              defaultRetroEffectTimings.trackingDistortionDuration
            );
          }
        }
      }, defaultCameraTimings.cameraMoveInterval);
    } else {
      // Active game mode: Static gameplay camera
      const scene = cameraRef.current.getScene();
      // Reset to default game camera position
      const gameCamera = setupSceneCamera(scene);
      cameraRef.current.position = gameCamera.position.clone();
      cameraRef.current.target = gameCamera.target.clone();
      gameCamera.dispose();
    }
  };

  // Handle retro effects based on game mode
  const setupRetroEffects = () => {
    if (!retroEffectsRef.current || !sceneRef.current || !cameraRef.current) return;

    // Clear any existing glitch timer
    if (randomGlitchTimerRef.current) {
      window.clearTimeout(randomGlitchTimerRef.current);
      randomGlitchTimerRef.current = null;
    }

    if (gameMode === 'background') {
      // Background mode: Use cinematic retro effects
      // retroEffectsRef.current.updateBaseParams(cinematicRetroEffectsLevels);

      // Setup random glitch effects for background mode
      const scheduleNextGlitch = () => {
        const params = defaultCinematicGlitchTimings;
        const nextDelay =
          Math.floor(Math.random() * params.additiveEffectInterval) + params.baseEffectInterval;

        randomGlitchTimerRef.current = window.setTimeout(() => {
          if (!retroEffectsRef.current || !isVisible || gameMode !== 'background') return;

          const intensity = params.baseIntensity + Math.random() * params.randomIntensityMultiplier;
          const duration = params.baseDuration + Math.random() * params.randomDurationMultiplier;

          retroEffectsRef.current.setGlitchAmount(intensity, duration);
          scheduleNextGlitch();
        }, nextDelay);
      };

      scheduleNextGlitch();
    } else {
      // Active game mode: Use default retro effects
      // retroEffectsRef.current.updateBaseParams(defaultRetroEffectsLevels);
    }
  };

  // Animate ball after score (only in active game mode)
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
    enableRequiredExtensions(engine);
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    const bgColor = parseColor('#33353e');
    scene.clearColor = new Color4(bgColor.r, bgColor.g, bgColor.b, 1.0);

    const camera = setupSceneCamera(scene);
    const pipeline = setupPostProcessing(scene, camera, gameMode === 'background');

    // Apply optimizations for all modes
    applyLowQualitySettings(scene, pipeline);

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

    // Configure based on mode
    if (gameMode === 'active') {
      sparkEffectsRef.current = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);
      retroEffectsRef.current = createPongRetroEffects(
        scene,
        camera,
        'default',
        retroEffectsPresets.default,
        defaultRetroEffectsBaseParams
      );
    } else {
      retroEffectsRef.current = createPongRetroEffects(
        scene,
        camera,
        'cinematic',
        retroEffectsPresets.cinematic,
        defaultRetroCinematicBaseParams
      );
    }

    retroLevelsRef.current =
      gameMode === 'background' ? retroEffectsPresets.cinematic : defaultRetroEffectsLevels;

    setupCamera();
    setupRenderLoop();
    setupRetroEffects();

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

  // Handle visibility changes
  useEffect(() => {
    if (!engineRef.current || !retroEffectsRef.current) return;

    if (!isVisible) {
      // Apply tracking distortion for transition out
      retroEffectsRef.current.simulateTrackingDistortion(
        defaultRetroEffectTimings.trackingDistortionIntensity,
        defaultRetroEffectTimings.trackingDistortionDuration
      );

      // Stop render loop after distortion duration
      setTimeout(() => {
        if (engineRef.current) engineRef.current.stopRenderLoop();
      }, defaultRetroEffectTimings.trackingDistortionDuration);
    } else {
      // Start render loop based on mode
      setupRenderLoop();

      // Apply initial tracking distortion when becoming visible
      retroEffectsRef.current.simulateTrackingDistortion(
        defaultRetroEffectTimings.trackingDistortionIntensity,
        defaultRetroEffectTimings.trackingDistortionDuration
      );
    }
  }, [isVisible]);

  // Handle game mode changes
  useEffect(() => {
    if (!retroEffectsRef.current || !isVisible) return;

    if (gameMode !== lastGameMode) {
      setIsTransitioning(true);

      // Apply transition effect
      retroEffectsRef.current.simulateTrackingDistortion(
        defaultRetroEffectTimings.trackingDistortionIntensity * 1.5, // Stronger effect for mode transition
        defaultRetroEffectTimings.trackingDistortionDuration
      );

      // Apply mode-specific changes after transition
      setTimeout(() => {
        setupCamera();
        setupRenderLoop();
        setupRetroEffects();
        setIsTransitioning(false);
        setLastGameMode(gameMode);

        if (onTransitionComplete) {
          onTransitionComplete(gameMode);
        }
      }, defaultRetroEffectTimings.trackingDistortionDuration);
    }
  }, [gameMode, lastGameMode, isVisible]);

  // Handle power-ups (only in active game mode)
  useEffect(() => {
    if (gameMode !== 'active' || !gameState) return;

    const powerUps = gameState.powerUps || [];
    const powerUpsChanged = JSON.stringify(powerUps) !== JSON.stringify(prevPowerUpsRef.current);

    if (powerUpsChanged) {
      // This would handle power-up effects in active game mode
      // Would need to implement PowerUpEffectsManager here
      prevPowerUpsRef.current = [...powerUps];
    }
  }, [gameState, gameMode]);

  // Handle game object updates
  useEffect(() => {
    if (
      !canvasRef.current ||
      !sceneRef.current ||
      !cameraRef.current ||
      !themeColors.current ||
      !isVisible ||
      isTransitioning
    )
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
    const collision = detectCollision(prevBallState.current.dx, ball.dx, ball.y);

    // Only detect score in active game mode
    const score =
      gameMode === 'active'
        ? detectScore(players.player1.score, players.player2.score, lastScoreRef.current, ball.dx)
        : null;

    // Apply ball effects in both modes
    applyBallEffects(ballRef.current, speed, angle, ball.spin, primaryColor);

    // Ball spark effects only in active mode
    if (gameMode === 'active' && sparkEffectsRef.current) {
      sparkEffectsRef.current(speed, ball.spin);
    }

    // Handle collisions in both modes
    if (collision) {
      const paddleToRecoil = ball.dx > 0 ? player1Ref.current : player2Ref.current;
      const edgeToDeform = ball.dy > 0 ? topEdgeRef.current : bottomEdgeRef.current;

      applyCollisionEffects(
        retroEffectsRef.current,
        ballRef.current,
        paddleToRecoil,
        edgeToDeform,
        collision,
        speed,
        ball.spin,
        primaryColor,
        gameMode === 'active', // Only play sound in active mode
        gameMode === 'active' ? soundManagerRef.current : null
      );
    }

    // Score effects only in active game mode
    if (score && gameMode === 'active') {
      const scoringPlayerPaddle = score === 'player1' ? player1Ref.current : player2Ref.current;
      const scoredAgainstPaddle = score === 'player1' ? player2Ref.current : player1Ref.current;

      animateBallAfterScore(sceneRef.current, ballRef.current, ball, cameraRef.current, score);

      applyScoreEffects(
        retroEffectsRef.current,
        sceneRef.current,
        topEdgeRef.current,
        bottomEdgeRef.current,
        scoringPlayerPaddle,
        scoredAgainstPaddle,
        players[score].score,
        speed,
        players,
        ball,
        primaryColor,
        soundManagerRef.current,
        cameraRef.current
      );
    }

    // Player effects only in active game mode
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
  }, [gameState, isVisible, gameMode, isTransitioning]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full pointer-events-none bg-[#33353e]"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: `opacity ${defaultRetroEffectTimings.trackingDistortionDuration}ms ease-out`,
      }}
    />
  );
};

export default UnifiedGameCanvas;
