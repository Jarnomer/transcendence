import React, { useEffect, useRef, useState } from 'react';

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

import { useGraphicsContext } from '@contexts';

import { LoadingOverlay } from '@components/game';

import {
  GameSoundManager,
  RetroEffectsManager,
  animateCinematicCamera,
  animateGameplayCamera,
  applyBackgroundCollisionEffects,
  applyBackgroundScoreEffects,
  applyBallEffects,
  applyCinematicCameraAngle,
  applyCollisionEffects,
  applyGameOverEffects,
  applyGameplayCameraAngle,
  applyLowQualitySettings,
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
  getGameSoundManager,
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
  defaultCameraTimings,
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

// Loading step type definition
interface LoadingStep {
  name: string;
  weight: number;
  action: () => Promise<void>;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({
  gameState,
  gameMode,
  gameStatus,
  theme = 'dark',
}) => {
  const { state: graphicsSettings } = useGraphicsContext();
  const prevBallState = useRef({ x: 0, y: 0, dx: 0, dy: 0, spin: 0 });
  const themeColors = useRef<{
    primaryColor: Color3;
    secondaryColor: Color3;
    gameboardColor: Color3;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentLoadingTask, setCurrentLoadingTask] = useState('Initializing');
  const [sceneReady, setSceneReady] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);

  const soundManagerRef = useRef<GameSoundManager>(null);
  const postProcessingRef = useRef<DefaultRenderingPipeline | null>(null);
  const retroEffectsRef = useRef<RetroEffectsManager | null>(null);
  const retroLevelsRef = useRef<RetroEffectsLevels>(cinematicRetroEffectsLevels);

  const retroEnabled = graphicsSettings?.retroEffect?.enabled !== false;
  const retroLevel = retroEnabled ? graphicsSettings?.retroEffect?.level || 5 : 0;

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
      }, defaultCameraTimings.cameraSwitchAngleInterval);
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
      }, 1000);
    }, 1000);
  };

  // Progressive loading process
  const initializeScene = async () => {
    if (!canvasRef.current || !gameState) return;

    // Define loading steps
    const loadingSteps: LoadingStep[] = [
      {
        name: 'Initializing engine',
        weight: 10,
        action: async () => {
          const canvas = canvasRef.current!;
          const engine = new Engine(canvas, true);
          engineRef.current = engine;

          // Add a small delay to simulate loading time
          await new Promise((resolve) => setTimeout(resolve, 300));
        },
      },
      {
        name: 'Creating scene',
        weight: 15,
        action: async () => {
          const scene = new Scene(engineRef.current!);
          sceneRef.current = scene;

          const colors = getThemeColorsFromDOM(theme);
          const { sceneBackgroundColor } = colors;

          scene.clearColor = new Color4(
            sceneBackgroundColor.r,
            sceneBackgroundColor.g,
            sceneBackgroundColor.b,
            1.0
          );

          themeColors.current = colors;

          await new Promise((resolve) => setTimeout(resolve, 400));
        },
      },
      {
        name: 'Setting up camera',
        weight: 10,
        action: async () => {
          const camera = setupSceneCamera(sceneRef.current!);
          camera.attachControl();
          cameraRef.current = camera;

          await new Promise((resolve) => setTimeout(resolve, 300));
        },
      },
      {
        name: 'Initializing sound system',
        weight: 10,
        action: async () => {
          soundManagerRef.current = getGameSoundManager();

          await new Promise((resolve) => setTimeout(resolve, 300));
        },
      },
      {
        name: 'Creating retro effects',
        weight: 15,
        action: async () => {
          if (retroEnabled) {
            retroLevelsRef.current = {
              ...retroEffectsPresets.cinematic,
              scanlines: retroLevel,
              curvature: retroLevel,
              glitch: retroLevel,
              colorBleed: retroLevel,
              flicker: retroLevel,
              vignette: retroLevel,
              noise: retroLevel,
            };

            retroEffectsRef.current = createPongRetroEffects(
              sceneRef.current!,
              cameraRef.current!,
              'cinematic',
              retroLevelsRef.current,
              defaultRetroCinematicBaseParams
            );
          } else {
            retroLevelsRef.current = {
              scanlines: 0,
              curvature: 0,
              glitch: 0,
              colorBleed: 0,
              flicker: 0,
              vignette: 0,
              noise: 0,
            };

            retroEffectsRef.current = createPongRetroEffects(
              sceneRef.current!,
              cameraRef.current!,
              'cinematic',
              retroLevelsRef.current,
              defaultRetroCinematicBaseParams
            );
          }

          await new Promise((resolve) => setTimeout(resolve, 400));
        },
      },
      {
        name: 'Setting up post-processing',
        weight: 10,
        action: async () => {
          const pipeline = setupPostProcessing(sceneRef.current!, cameraRef.current!, false);
          postProcessingRef.current = pipeline;

          await new Promise((resolve) => setTimeout(resolve, 300));
        },
      },
      {
        name: 'Creating scene lighting',
        weight: 10,
        action: async () => {
          const { shadowGenerators } = setupScenelights(
            sceneRef.current!,
            themeColors.current!.primaryColor
          );
          applyLowQualitySettings(
            sceneRef.current!,
            2.0,
            postProcessingRef.current,
            shadowGenerators
          );
          enableRequiredExtensions(engineRef.current!);

          await new Promise((resolve) => setTimeout(resolve, 300));
        },
      },
      {
        name: 'Creating game objects',
        weight: 20,
        action: async () => {
          const { primaryColor, gameboardColor } = themeColors.current!;

          floorRef.current = createFloor(sceneRef.current!, gameboardColor);
          topEdgeRef.current = createEdge(sceneRef.current!, primaryColor);
          bottomEdgeRef.current = createEdge(sceneRef.current!, primaryColor);
          player1Ref.current = createPaddle(sceneRef.current!, primaryColor);
          player2Ref.current = createPaddle(sceneRef.current!, primaryColor);
          ballRef.current = createBall(sceneRef.current!, primaryColor);

          await new Promise((resolve) => setTimeout(resolve, 600));
        },
      },
      {
        name: 'Finalizing setup',
        weight: 10,
        action: async () => {
          const gameObjects = [
            player1Ref.current!,
            player2Ref.current!,
            ballRef.current!,
            topEdgeRef.current!,
            bottomEdgeRef.current!,
          ];

          setupReflections(sceneRef.current!, floorRef.current!, gameObjects);

          topEdgeRef.current!.position.x = gameToSceneX(0, topEdgeRef.current!);
          topEdgeRef.current!.position.y = gameToSceneY(-10, topEdgeRef.current!);
          bottomEdgeRef.current!.position.x = gameToSceneX(0, bottomEdgeRef.current!);
          bottomEdgeRef.current!.position.y = gameToSceneY(gameHeight + 2, bottomEdgeRef.current!);

          lastGameModeRef.current = gameMode;

          setupRenderLoop(engineRef.current!, sceneRef.current!);
          setupRandomGlitchEffects();
          setupCamera();

          // Attach resize event listener
          const handleResize = () => {
            if (engineRef.current) {
              engineRef.current.resize();
              if (sceneRef.current) {
                setupRenderLoop(engineRef.current, sceneRef.current);
              }
            }
          };

          window.addEventListener('resize', handleResize);

          await new Promise((resolve) => setTimeout(resolve, 400));
        },
      },
    ];

    const totalWeight = loadingSteps.reduce((sum, step) => sum + step.weight, 0);
    let completedWeight = 0;

    // Execute each loading step
    for (const step of loadingSteps) {
      setCurrentLoadingTask(step.name);

      try {
        await step.action();
      } catch (error) {
        console.error(`Error during step "${step.name}":`, error);
      }

      completedWeight += step.weight;
      setLoadingProgress(Math.round((completedWeight / totalWeight) * 100));
    }

    // Loading complete
    setTimeout(() => {
      setIsLoading(false);
      setSceneReady(true);
    }, 300);
  };

  // Initial render setup
  useEffect(() => {
    if (canvasRef.current) canvasRef.current.style.opacity = '0';

    initializeScene();

    return () => {
      if (retroEffectsRef.current) retroEffectsRef.current.dispose();

      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }

      if (randomGlitchTimerRef.current) {
        window.clearTimeout(randomGlitchTimerRef.current);
        randomGlitchTimerRef.current = null;
      }

      window.removeEventListener('resize', () => {});
      document.removeEventListener('visibilitychange', () => {});

      if (engineRef.current && sceneRef.current) {
        engineRef.current.dispose();
        sceneRef.current.dispose();
      }
    };
  }, []);

  // Show canvas when ready
  useEffect(() => {
    if (sceneReady && canvasRef.current) {
      canvasRef.current.style.transition = 'opacity 0.8s ease-in-out';
      canvasRef.current.style.opacity = '1';
    }
  }, [sceneReady]);

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
          3000, // duration in ms
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

  return (
    <>
      <LoadingOverlay
        isLoading={isLoading}
        progress={loadingProgress}
        currentTask={currentLoadingTask}
      />
      <canvas ref={canvasRef} className="w-full h-full" style={{ opacity: 0 }} />
    </>
  );
};
