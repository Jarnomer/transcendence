import React, { useEffect, useRef } from 'react';

import {
  ArcRotateCamera,
  Color3,
  Vector3,
  DefaultRenderingPipeline,
  Engine,
  Scene,
} from 'babylonjs';

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
  gameToSceneX,
  gameToSceneY,
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
  defaultGameObjectParams,
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

const detectCollision = (prevDx: number, newDx: number, newY: number): 'dx' | 'dy' | null => {
  const gameHeight = defaultGameParams.dimensions.gameHeight;
  const dxCollision = Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = newY === 0 || newY === gameHeight - 15;

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

  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const gameHeight = defaultGameParams.dimensions.gameHeight;

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

    topEdgeRef.current.position = new Vector3(
      0,
      gameToSceneY(0, bottomEdgeRef.current) + 0.5,
      defaultGameObjectParams.distanceFromFloor
    );
    bottomEdgeRef.current.position = new Vector3(
      0,
      gameToSceneY(gameHeight, bottomEdgeRef.current) - 0.5,
      defaultGameObjectParams.distanceFromFloor
    );

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

  // Handle visibility and camera positions
  useEffect(() => {
    if (!engineRef.current || !sceneRef.current || !cameraRef.current) return;

    // Clear any existing camera movement timer
    if (cameraMoveTimerRef.current) {
      window.clearInterval(cameraMoveTimerRef.current);
      cameraMoveTimerRef.current = null;
    }

    if (!isVisible) {
      engineRef.current.runRenderLoop(() => {
        if (sceneRef.current) sceneRef.current.render();
      });

      retroEffectsRef.current.simulateCRTTurnOff(1800).then(() => {
        if (engineRef.current) engineRef.current.stopRenderLoop();
      });
    } else {
      const randomAngle = getRandomCameraAngle();
      const camera = cameraRef.current;

      applyCameraAngle(camera, randomAngle, postProcessingRef.current);

      currentAngleIndexRef.current = cameraAngles.findIndex((angle) => angle === randomAngle);

      cameraMoveTimerRef.current = window.setInterval(() => {
        if (cameraRef.current) {
          currentAngleIndexRef.current = (currentAngleIndexRef.current + 1) % cameraAngles.length;
          const newAngle = cameraAngles[currentAngleIndexRef.current];

          animateCamera(cameraRef.current, newAngle, postProcessingRef.current);
        }
      }, 10000); // Change camera every 10 seconds

      engineRef.current.runRenderLoop(() => {
        if (sceneRef.current) sceneRef.current.render();
      });

      if (retroEffectsRef.current) {
        setTimeout(() => {
          retroEffectsRef.current.simulateCRTTurnOn();
        }, 500);
      }
    }

    return () => {
      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }
    };
  }, [isVisible]);

  // Update game objects
  useEffect(() => {
    if (!themeColors.current || !isVisible) return;

    const { players, ball } = gameState;
    const color = themeColors.current.primaryColor;

    // Convert coordinates to Babylon coordinate system
    player1Ref.current.position = new Vector3(
      gameToSceneX(0, player1Ref.current),
      gameToSceneY(players.player1.y, player1Ref.current),
      defaultGameObjectParams.distanceFromFloor
    );
    player2Ref.current.position = new Vector3(
      gameToSceneX(gameWidth, player2Ref.current),
      gameToSceneY(players.player2.y, player2Ref.current),
      defaultGameObjectParams.distanceFromFloor
    );
    ballRef.current.position = new Vector3(
      gameToSceneX(ball.x, ballRef.current),
      gameToSceneY(ball.y, ballRef.current),
      defaultGameObjectParams.distanceFromFloor
    );

    // Calculate current speed and angle, detect collision and score
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);
    const collision = detectCollision(prevBallState.current.dx, ball.dx, ball.y);
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

    if (score) applyScoreEffects(retroEffectsRef.current);

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
      }}
    />
  );
};

export default BackgroundGameCanvas;
