import React, { useEffect, useRef } from 'react';

import {
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  Engine,
  Mesh,
  Scene,
} from 'babylonjs';

import {
  RetroEffectsManager,
  createPongRetroEffects,
  animateCinematicCamera,
  animateGameplayCamera,
  applyCinematicCameraAngle,
  applyGameplayCameraAngle,
  gameplayCameraAngles,
  getNextCinematicCameraAngle,
  applyBackgroundCollisionEffects,
  applyBackgroundScoreEffects,
  applyLowQualitySettings,
  applyBallEffects,
  createBall,
  createEdge,
  createFloor,
  createPaddle,
  detectScore,
  detectCollision,
  gameToSceneX,
  gameToSceneY,
  enableRequiredExtensions,
  getThemeColorsFromDOM,
  parseColor,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import {
  GameMode,
  GameState,
  GameStatus,
  RetroEffectsLevels,
  cinematicRetroEffectsLevels,
  defaultCameraTimings,
  defaultCinematicGlitchTimings,
  defaultGameParams,
  defaultRetroCinematicBaseParams,
  defaultRetroEffectTimings,
  retroEffectsPresets,
} from '@shared/types';

interface BackgroundCanvasProps {
  gameState: GameState;
  gameMode: GameMode;
  gameStatus: GameStatus;
  theme?: 'light' | 'dark';
}

const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  gameState,
  gameMode,
  gameStatus,
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

  const postProcessingRef = useRef<DefaultRenderingPipeline | null>(null);
  const retroEffectsRef = useRef<RetroEffectsManager | null>(null);
  const retroLevelsRef = useRef<RetroEffectsLevels>(cinematicRetroEffectsLevels);

  const cameraMoveTimerRef = useRef<number | null>(null);
  const randomGlitchTimerRef = useRef<number | null>(null);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const lastGameModeRef = useRef<GameMode>('background');

  const floorRef = useRef<Mesh | null>(null);
  const topEdgeRef = useRef<Mesh | null>(null);
  const bottomEdgeRef = useRef<Mesh | null>(null);
  const player1Ref = useRef<Mesh | null>(null);
  const player2Ref = useRef<Mesh | null>(null);
  const ballRef = useRef<Mesh | null>(null);

  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const gameHeight = defaultGameParams.dimensions.gameHeight;

  const setupCamera = () => {
    if (!engineRef.current || !sceneRef.current || !cameraRef.current) return;

    if (cameraMoveTimerRef.current) {
      window.clearInterval(cameraMoveTimerRef.current);
      cameraMoveTimerRef.current = null;
    }

    if (gameMode === 'background') {
      const cinematicAngle = getNextCinematicCameraAngle();

      applyCinematicCameraAngle(cameraRef.current, cinematicAngle);
      animateCinematicCamera(cameraRef.current, cinematicAngle);

      cameraMoveTimerRef.current = window.setInterval(() => {
        if (cameraRef.current) {
          const nextCinematicAngle = getNextCinematicCameraAngle();

          applyCinematicCameraAngle(cameraRef.current, nextCinematicAngle);
          animateCinematicCamera(cameraRef.current, nextCinematicAngle);

          if (retroEffectsRef.current) {
            retroEffectsRef.current.simulateTrackingDistortion(
              defaultRetroEffectTimings.trackingDistortionIntensity,
              defaultRetroEffectTimings.trackingDistortionDuration
            );
          }
        }
      }, defaultCameraTimings.cameraMoveInterval);
    } else {
      if (cameraRef.current) {
        const gameplayAngle = gameplayCameraAngles[0];

        applyGameplayCameraAngle(cameraRef.current, gameplayAngle);
        animateGameplayCamera(cameraRef.current, gameplayAngle);

        if (retroEffectsRef.current) {
          retroEffectsRef.current.simulateTrackingDistortion(
            defaultRetroEffectTimings.trackingDistortionIntensity,
            defaultRetroEffectTimings.trackingDistortionDuration
          );
        }
      }
    }
  };

  const setupRenderLoop = (engine: Engine, scene: Scene) => {
    engine.stopRenderLoop();

    const frameRate = 30;
    const interval = 1000 / frameRate;

    let lastTime = 0;

    engine.runRenderLoop(() => {
      const currentTime = performance.now();
      if (currentTime - lastTime >= interval) {
        lastTime = currentTime;
        scene.render();
      }
    });
  };

  const setupRandomGlitchEffects = () => {
    if (!retroEffectsRef.current) return;

    if (randomGlitchTimerRef.current) {
      window.clearTimeout(randomGlitchTimerRef.current);
      randomGlitchTimerRef.current = null;
    }

    const scheduleNextGlitch = () => {
      if (gameMode !== 'background') return;

      const params = defaultCinematicGlitchTimings;
      const nextDelay =
        Math.floor(Math.random() * params.additiveEffectInterval) + params.baseEffectInterval;

      randomGlitchTimerRef.current = window.setTimeout(() => {
        if (!retroEffectsRef.current || gameMode !== 'background') return;

        const intensity = params.baseIntensity + Math.random() * params.randomIntensityMultiplier;
        const duration = params.baseDuration + Math.random() * params.randomDurationMultiplier;

        retroEffectsRef.current.setGlitchAmount(intensity, duration);

        scheduleNextGlitch(); // Schedule next glitch
      }, nextDelay);
    };

    scheduleNextGlitch();
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

    retroLevelsRef.current = retroEffectsPresets.cinematic;
    retroEffectsRef.current = createPongRetroEffects(
      scene,
      camera,
      'cinematic',
      retroLevelsRef.current,
      defaultRetroCinematicBaseParams
    );

    const pipeline = setupPostProcessing(scene, camera, false);

    const { shadowGenerators } = setupScenelights(scene, primaryColor);

    applyLowQualitySettings(scene, 2.0, pipeline, shadowGenerators);
    enableRequiredExtensions(engine);

    engineRef.current = engine;
    sceneRef.current = scene;
    cameraRef.current = camera;
    themeColors.current = colors;

    postProcessingRef.current = pipeline;
    lastGameModeRef.current = gameMode;

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

    topEdgeRef.current.position.x = gameToSceneX(0, topEdgeRef.current);
    topEdgeRef.current.position.y = gameToSceneY(-10, topEdgeRef.current);
    bottomEdgeRef.current.position.x = gameToSceneX(0, bottomEdgeRef.current);
    bottomEdgeRef.current.position.y = gameToSceneY(gameHeight + 2, bottomEdgeRef.current);

    setupRenderLoop(engine, scene);
    setupRandomGlitchEffects();
    setupCamera();

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
        if (sceneRef.current) {
          setupRenderLoop(engineRef.current, sceneRef.current);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (engineRef.current) engineRef.current.renderEvenInBackground = false;
      } else {
        if (engineRef.current && sceneRef.current) {
          engineRef.current.renderEvenInBackground = true;
          setupRenderLoop(engineRef.current, sceneRef.current);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

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

  // Handle game modes
  useEffect(() => {
    if (!cameraRef.current || !retroEffectsRef.current || !engineRef.current || !sceneRef.current)
      return;

    if (lastGameModeRef.current !== gameMode) {
      setupRenderLoop(engineRef.current, sceneRef.current);
      setupRandomGlitchEffects();
      setupCamera();

      lastGameModeRef.current = gameMode;
    }
  }, [gameMode]);

  // Handle game objects
  useEffect(() => {
    if (
      !canvasRef.current ||
      !sceneRef.current ||
      !cameraRef.current ||
      !themeColors.current ||
      !player1Ref.current ||
      !player2Ref.current ||
      !ballRef.current ||
      !topEdgeRef.current ||
      !bottomEdgeRef.current
    )
      return;

    const { players, ball } = gameState;

    const primaryColor = themeColors.current.primaryColor;

    const ballSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const ballAngle = Math.atan2(ball.dx, -ball.dy);

    if (gameMode === 'background') {
      player1Ref.current.position.x = gameToSceneX(0, player1Ref.current);
      player1Ref.current.position.y = gameToSceneY(players.player1.y, player1Ref.current);
      player2Ref.current.position.x = gameToSceneX(gameWidth, player2Ref.current);
      player2Ref.current.position.y = gameToSceneY(players.player2.y, player2Ref.current);
      ballRef.current.position.x = gameToSceneX(ball.x, ballRef.current);
      ballRef.current.position.y = gameToSceneY(ball.y, ballRef.current);

      applyBallEffects(ballRef.current, ballSpeed, ballAngle, ball.spin, primaryColor);

      prevBallState.current = {
        x: ball.x,
        y: ball.y,
        dx: ball.dx,
        dy: ball.dy,
        spin: ball.spin,
      };
    } else {
      const collisionType = detectCollision(prevBallState.current.dx, ball.dx, ball.y);

      if (collisionType) {
        applyBackgroundCollisionEffects(retroEffectsRef.current, ballSpeed, ball.spin, true);
      }

      const scoringPlayer = detectScore(
        players.player1.score,
        players.player2.score,
        lastScoreRef.current,
        ball.dx
      );

      if (scoringPlayer) {
        applyBackgroundScoreEffects(
          retroEffectsRef.current,
          players[scoringPlayer].score,
          ballSpeed,
          ball.spin
        );
      }
    }
  }, [gameState]);

  return <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />;
};

export default BackgroundCanvas;
