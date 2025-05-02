import React, { useEffect, useRef } from 'react';

import {
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  Engine,
  Mesh,
  PBRMaterial,
  Scene,
} from 'babylonjs';

import {
  GameAnimationManager,
  RetroEffectsManager,
  GameSoundManager,
  addCameraDebugControls,
  animateCinematicCamera,
  animateGameplayCamera,
  applyBackgroundCollisionEffects,
  applyBackgroundScoreEffects,
  applyBallEffects,
  applyGameOverEffects,
  applyCinematicCameraAngle,
  applyCollisionEffects,
  applyGameplayCameraAngle,
  applyLowQualitySettings,
  getGameSoundManager,
  createBall,
  createEdge,
  createFloor,
  createPaddle,
  createPongRetroEffects,
  detectCollision,
  detectScore,
  enableRequiredExtensions,
  gameToSceneX,
  gameToSceneY,
  gameplayCameraAngles,
  getNextCinematicCameraAngle,
  getThemeColorsFromDOM,
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
  // defaultCameraTimings,
  defaultCinematicGlitchTimings,
  defaultGameObjectParams,
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

  const soundManagerRef = useRef<GameSoundManager>(null);
  const postProcessingRef = useRef<DefaultRenderingPipeline | null>(null);
  const retroEffectsRef = useRef<RetroEffectsManager | null>(null);
  const retroLevelsRef = useRef<RetroEffectsLevels>(cinematicRetroEffectsLevels);

  const cameraMoveTimerRef = useRef<number | null>(null);
  const randomGlitchTimerRef = useRef<number | null>(null);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const lastGameModeRef = useRef<GameMode>('background');
  const prevGameStatusRef = useRef<GameStatus | null>(null);

  const floorRef = useRef<Mesh | null>(null);
  const topEdgeRef = useRef<Mesh | null>(null);
  const bottomEdgeRef = useRef<Mesh | null>(null);
  const player1Ref = useRef<Mesh | null>(null);
  const player2Ref = useRef<Mesh | null>(null);
  const ballRef = useRef<Mesh | null>(null);

  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const gameHeight = defaultGameParams.dimensions.gameHeight;

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
      }, 10000000); // }, defaultCameraTimings.cameraSwitchAngleInterval);
    } else {
      performCameraSequence();
    }
  };

  const performCameraSequence = () => {
    if (
      !cameraRef.current ||
      !retroEffectsRef.current ||
      !player1Ref.current ||
      !player2Ref.current ||
      !ballRef.current
    )
      return;

    const { players, ball } = gameState;

    player1Ref.current.position.x = gameToSceneX(0, player1Ref.current);
    player1Ref.current.position.y = gameToSceneY(players.player1.y, player1Ref.current);
    player2Ref.current.position.x = gameToSceneX(gameWidth, player2Ref.current);
    player2Ref.current.position.y = gameToSceneY(players.player2.y, player2Ref.current);
    ballRef.current.position.x = gameToSceneX(ball.x, ballRef.current);
    ballRef.current.position.y = gameToSceneY(ball.y, ballRef.current);

    if (cameraMoveTimerRef.current) {
      window.clearInterval(cameraMoveTimerRef.current);
      cameraMoveTimerRef.current = null;
    }

    const angle1 = gameplayCameraAngles[1]; // player 1
    applyGameplayCameraAngle(cameraRef.current, angle1);
    animateGameplayCamera(cameraRef.current, angle1);
    retroEffectsRef.current.simulateTrackingDistortion(
      defaultRetroEffectTimings.trackingDistortionIntensity * 1.5,
      defaultRetroEffectTimings.trackingDistortionDuration / 2
    );

    setTimeout(() => {
      if (!cameraRef.current || !retroEffectsRef.current) return;

      const angle2 = gameplayCameraAngles[2]; // player 2
      applyGameplayCameraAngle(cameraRef.current, angle2);
      animateGameplayCamera(cameraRef.current, angle2);
      retroEffectsRef.current.simulateTrackingDistortion(
        defaultRetroEffectTimings.trackingDistortionIntensity * 1.5,
        defaultRetroEffectTimings.trackingDistortionDuration / 2
      );

      setTimeout(() => {
        if (!cameraRef.current || !retroEffectsRef.current) return;

        const angle0 = gameplayCameraAngles[0]; // gameplay
        applyGameplayCameraAngle(cameraRef.current, angle0);
        animateGameplayCamera(cameraRef.current, angle0);
        retroEffectsRef.current.simulateTrackingDistortion(
          defaultRetroEffectTimings.trackingDistortionIntensity * 1.5,
          defaultRetroEffectTimings.trackingDistortionDuration / 2
        );
      }, 1500);
    }, 1500);
  };

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    soundManagerRef.current = getGameSoundManager();
    GameAnimationManager.getInstance(scene);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, gameboardColor, sceneBackgroundColor } = colors;

    scene.clearColor = new Color4(
      sceneBackgroundColor.r,
      sceneBackgroundColor.g,
      sceneBackgroundColor.b,
      1.0
    );

    const camera = setupSceneCamera(scene);
    camera.attachControl();

    const cameraDebugControls = addCameraDebugControls(camera, scene, true);

    setTimeout(() => {
      if (canvas) {
        canvas.focus();
        console.log('Canvas focused for keyboard input');
      }
    }, 500);

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

    floorRef.current = createFloor(scene, gameboardColor);
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

      cameraDebugControls();
      engine.dispose();
      scene.dispose();
    };
  }, []);

  // Handle game over
  useEffect(() => {
    if (prevGameStatusRef.current === 'playing' && gameStatus === 'finished') {
      const isPlayer1Loser = gameState.players.player1.score < gameState.players.player2.score;
      const losingPaddle = isPlayer1Loser ? player1Ref.current : player2Ref.current;

      if (sceneRef.current && losingPaddle && ballRef.current && themeColors.current) {
        applyGameOverEffects(
          sceneRef.current,
          losingPaddle,
          ballRef.current,
          gameState.ball,
          themeColors.current.primaryColor,
          5000, // duration in ms
          soundManagerRef.current
        );
      }
    }

    prevGameStatusRef.current = gameStatus;
  }, [gameStatus, gameState]);

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

  // Handle theme changes
  useEffect(() => {
    if (!sceneRef.current || !themeColors.current) return;

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, gameboardColor, sceneBackgroundColor } = colors;

    themeColors.current = colors;

    if (sceneRef.current) {
      sceneRef.current.clearColor = new Color4(
        sceneBackgroundColor.r,
        sceneBackgroundColor.g,
        sceneBackgroundColor.b,
        1.0
      );
    }

    if (floorRef.current && floorRef.current.material) {
      const floorMaterial = floorRef.current.material as PBRMaterial;
      const multipleColor = defaultGameObjectParams.floor.colorMultiplier;
      const adjustedColor = new Color3(
        Math.max(multipleColor, gameboardColor.r),
        Math.max(multipleColor, gameboardColor.g),
        Math.max(multipleColor, gameboardColor.b)
      );
      floorMaterial.albedoColor = adjustedColor;
      floorMaterial.emissiveColor = new Color3(
        gameboardColor.r * defaultGameObjectParams.floor.emissiveColorMultiplier,
        gameboardColor.g * defaultGameObjectParams.floor.emissiveColorMultiplier,
        gameboardColor.b * defaultGameObjectParams.floor.emissiveColorMultiplier
      );
    }

    const gameObjects = [
      topEdgeRef.current,
      bottomEdgeRef.current,
      player1Ref.current,
      player2Ref.current,
      ballRef.current,
    ];

    gameObjects.forEach((mesh) => {
      if (mesh && mesh.material) {
        const material = mesh.material as PBRMaterial;
        material.albedoColor = primaryColor;

        let emissiveMultiplier;
        if (mesh === ballRef.current) {
          emissiveMultiplier = defaultGameObjectParams.ball.emissiveColorMultiplier;
        } else if (mesh === topEdgeRef.current || mesh === bottomEdgeRef.current) {
          emissiveMultiplier = defaultGameObjectParams.edge.emissiveColorMultiplier;
        } else {
          emissiveMultiplier = defaultGameObjectParams.paddle.emissiveColorMultiplier;
        }

        material.emissiveColor = new Color3(
          primaryColor.r * emissiveMultiplier,
          primaryColor.g * emissiveMultiplier,
          primaryColor.b * emissiveMultiplier
        );
      }
    });
  }, [theme]);

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

    const collisionType = detectCollision(prevBallState.current.dx, ball.dx, ball.y);

    if (gameMode === 'background') {
      player1Ref.current.position.x = gameToSceneX(0, player1Ref.current);
      player1Ref.current.position.y = gameToSceneY(players.player1.y, player1Ref.current);
      player2Ref.current.position.x = gameToSceneX(gameWidth, player2Ref.current);
      player2Ref.current.position.y = gameToSceneY(players.player2.y, player2Ref.current);
      ballRef.current.position.x = gameToSceneX(ball.x, ballRef.current);
      ballRef.current.position.y = gameToSceneY(ball.y, ballRef.current);

      applyBallEffects(ballRef.current, ballSpeed, ballAngle, ball.spin, primaryColor);

      if (collisionType) {
        const paddleToRecoil = ball.dx > 0 ? player1Ref.current : player2Ref.current;
        const edgeToDeform = ball.dy > 0 ? topEdgeRef.current : bottomEdgeRef.current;

        applyCollisionEffects(
          retroEffectsRef.current,
          ballRef.current,
          paddleToRecoil,
          edgeToDeform,
          collisionType,
          ballSpeed,
          ball.spin,
          primaryColor,
          false,
          null
        );
      }
    } else {
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

    prevBallState.current = {
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
      spin: ball.spin,
    };
  }, [gameState]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default BackgroundCanvas;
