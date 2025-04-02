import React, { useEffect, useRef } from 'react';

import { ArcRotateCamera, Color3, DefaultRenderingPipeline, Engine, Scene } from 'babylonjs';

import {
  RetroEffectsManager,
  applyBallEffects,
  applyCollisionEffects,
  applyScoreEffects,
  ballSparkEffect,
  createBall,
  createEdge,
  createFloor,
  createPaddle,
  createPongRetroEffects,
  getThemeColors,
  setupPostProcessing,
  setupReflections,
  setupScenelights,
  animateCamera,
  applyCameraAngle,
  cameraAngles,
  getRandomCameraAngle,
  setupSceneCamera,
} from '@game/utils';

import {
  GameState,
  RetroEffectsLevels,
  RetroEffectsBaseParams,
  defaultRetroEffectsLevels,
  defaultGameParams,
  retroEffectsPresets,
  defaultRetroCinematicBaseParams,
} from '@shared/types';

interface BackgroundGameCanvasProps {
  gameState: GameState;
  isVisible: boolean;
  theme?: 'light' | 'dark';
  retroPreset?: 'default' | 'cinematic';
  retroLevels?: RetroEffectsLevels;
  retroBaseParams?: RetroEffectsBaseParams;
}

const getThemeColorsFromDOM = (theme: 'light' | 'dark' = 'dark') => {
  const computedStyle = getComputedStyle(document.documentElement);

  document.documentElement.setAttribute('data-theme', theme);

  const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
  const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim();
  const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();

  return getThemeColors(theme, primaryColor, secondaryColor, backgroundColor);
};

const detectCollision = (
  gameHeight: number,
  prevDx: number,
  newDx: number,
  newY: number,
  prevY: number
): 'dx' | 'dy' | null => {
  const bottomBoundary = gameHeight - 10;
  const topBoundary = 0;

  const hitTop = newY <= topBoundary && prevY > topBoundary;
  const hitBottom = newY >= bottomBoundary && prevY < bottomBoundary;

  const dxCollision = Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = hitTop || hitBottom;

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

const BackgroundGameCanvas: React.FC<BackgroundGameCanvasProps> = ({
  gameState,
  isVisible,
  theme = 'dark',
  retroPreset = 'cinematic',
  retroLevels = retroEffectsPresets.cinematic,
  retroBaseParams = defaultRetroCinematicBaseParams,
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
  const sparkEffectsRef = useRef<((speed: number, spin: number) => void) | null>(null);
  const retroEffectsRef = useRef<RetroEffectsManager | null>(null);
  const retroLevelsRef = useRef<RetroEffectsLevels>(defaultRetroEffectsLevels);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const currentAngleIndexRef = useRef<number>(-1);
  const cameraMoveTimerRef = useRef<number | null>(null);

  const floorRef = useRef<any>(null);
  const topEdgeRef = useRef<any>(null);
  const bottomEdgeRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  const width = defaultGameParams.gameWidth;
  const height = defaultGameParams.gameHeight;
  const scaleFactor = 20;

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    const camera = setupSceneCamera(scene);
    const pipeline = setupPostProcessing(scene, camera, true);
    const { shadowGenerators } = setupScenelights(scene);

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

    // Set edge and paddle positions
    topEdgeRef.current.position.y = height / 2 / scaleFactor + 0.5;
    bottomEdgeRef.current.position.y = -height / 2 / scaleFactor - 0.5;
    player1Ref.current.position.x = -20;
    player2Ref.current.position.x = 19.5;

    sparkEffectsRef.current = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);
    retroEffectsRef.current = createPongRetroEffects(
      scene,
      camera,
      retroPreset,
      retroLevels,
      retroBaseParams
    );
    retroLevelsRef.current = retroLevels;

    if (isVisible) {
      engine.runRenderLoop(() => {
        scene.render();
      });
    }

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sparkEffectsRef.current) sparkEffectsRef.current(0, 0);
      if (retroEffectsRef.current) retroEffectsRef.current.dispose();
      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }
      engine.dispose();
      scene.dispose();
    };
  }, [isVisible]);

  // Handle visibility changes and initialize camera position
  useEffect(() => {
    if (!engineRef.current || !sceneRef.current || !cameraRef.current) return;

    // Clear any existing camera movement timer
    if (cameraMoveTimerRef.current) {
      window.clearInterval(cameraMoveTimerRef.current);
      cameraMoveTimerRef.current = null;
    }

    if (!isVisible) {
      engineRef.current.stopRenderLoop();
    } else {
      // When becoming visible, set a random initial camera angle
      const randomAngle = getRandomCameraAngle();
      const camera = cameraRef.current;

      // Apply the random camera angle
      applyCameraAngle(camera, randomAngle, postProcessingRef.current);

      // Find the index of the randomly chosen angle for tracking
      currentAngleIndexRef.current = cameraAngles.findIndex((angle) => angle === randomAngle);

      // Start the camera movement timer
      cameraMoveTimerRef.current = window.setInterval(() => {
        if (cameraRef.current) {
          // Move to the next camera angle
          currentAngleIndexRef.current = (currentAngleIndexRef.current + 1) % cameraAngles.length;
          const newAngle = cameraAngles[currentAngleIndexRef.current];

          // Animate to the new position with DOF settings
          animateCamera(cameraRef.current, newAngle, postProcessingRef.current);
        }
      }, 10000); // Change camera every 10 seconds

      // Start the render loop
      engineRef.current.runRenderLoop(() => {
        if (sceneRef.current) {
          sceneRef.current.render();
        }
      });
    }

    return () => {
      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }
    };
  }, [isVisible]);

  // Update effect levels
  useEffect(() => {
    if (!retroEffectsRef.current) return;

    try {
      if (retroLevels !== retroLevelsRef.current) {
        retroEffectsRef.current.updateLevels(retroLevels);
        retroLevelsRef.current = retroLevels;
      }

      if (retroPreset === 'cinematic' || retroPreset === 'default') {
        retroEffectsRef.current.applyPreset(retroPreset);
      }
    } catch (error) {
      console.error('Error updating retro effects:', error);
    }
  }, [retroLevels, retroPreset]);

  // Update game objects based on game state
  useEffect(() => {
    if (!themeColors.current) {
      console.log('No color theme');
      return;
    } else if (!isVisible) {
      console.log('Canvas not visible');
      return;
    }

    const { players, ball } = gameState;
    const color = themeColors.current.primaryColor;

    // Convert coordinates to Babylon coordinate system
    const player1Y = -((players.player1.y - height / 2) / scaleFactor) - 2;
    const player2Y = -((players.player2.y - height / 2) / scaleFactor) - 2;
    const ballY = -((ball.y - height / 2) / scaleFactor);
    const ballX = (ball.x - width / 2) / scaleFactor;

    // Update mesh positions directly
    player1Ref.current.position.y = player1Y;
    player2Ref.current.position.y = player2Y;
    ballRef.current.position.x = ballX;
    ballRef.current.position.y = ballY;

    // Calculate current speed and angle, detect collision and score
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);
    const collision = detectCollision(
      defaultGameParams.gameHeight,
      prevBallState.current.dx,
      ball.dx,
      prevBallState.current.y,
      ball.y
    );
    const score = detectScore(
      players.player1.score,
      players.player2.score,
      lastScoreRef.current,
      ball.dx
    );

    applyBallEffects(ballRef.current, speed, angle, ball.spin, color);

    if (sparkEffectsRef.current) sparkEffectsRef.current(speed, ball.spin);

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
        color,
        false
      );
    }

    if (score) {
      applyScoreEffects(retroEffectsRef.current);
    }

    prevBallState.current = {
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
      spin: ball.spin,
    };
  }, [gameState, isVisible]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.5s ease',
      }}
    />
  );
};

export default BackgroundGameCanvas;
