import React, { useEffect, useRef, useState } from 'react';

import { ArcRotateCamera, Color3, DefaultRenderingPipeline, Engine, Scene } from 'babylonjs';

import {
  RetroEffectsManager,
  applyBallEffects,
  applyCollisionEffects,
  applyScoreEffects,
  ballSparkEffect,
  createBall,
  createFloor,
  createPaddle,
  createPongRetroEffects,
  getThemeColors,
  setupEnvironmentMap,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import { GameState } from '@shared/types';

interface GameCanvasProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
}

// Fixed values for positions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const SCALE_FACTOR = 20;
const FIX_POSITION = 2;

// Helper function to get CSS variables (DOM-dependent code stays in the component)
const getThemeColorsFromDOM = (theme: 'light' | 'dark' = 'dark') => {
  // Get computed styles from document
  const computedStyle = getComputedStyle(document.documentElement);

  // Use the data-theme attribute values from CSS
  document.documentElement.setAttribute('data-theme', theme);

  // Get color values from CSS variables
  const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
  const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim();
  const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();

  return getThemeColors(theme, primaryColor, secondaryColor, backgroundColor);
};

const detectCollision = (
  prevDx: number,
  prevDy: number,
  newDx: number,
  newDy: number
): 'dx' | 'dy' | null => {
  const dxCollision = prevDx !== 0 && newDx !== 0 && Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = prevDy !== 0 && newDy !== 0 && Math.sign(prevDy) !== Math.sign(newDy);

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

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, theme = 'dark' }) => {
  const [lastTheme, setLastTheme] = useState(theme);

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

  const lastScoreRef = useRef<{ value: number }>({ value: 0 });

  const floorRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    setupEnvironmentMap(scene);

    const camera = setupSceneCamera(scene);
    const pipeline = setupPostProcessing(scene, camera);
    const { shadowGenerators } = setupScenelights(scene);

    floorRef.current = createFloor(scene, backgroundColor);
    player1Ref.current = createPaddle(scene, primaryColor);
    player2Ref.current = createPaddle(scene, primaryColor);
    ballRef.current = createBall(scene, primaryColor);

    const gameObjects = [player1Ref.current, player2Ref.current, ballRef.current];
    setupReflections(scene, floorRef.current, gameObjects);
    shadowGenerators.forEach((generator) => {
      gameObjects.forEach((obj) => {
        generator.addShadowCaster(obj);
      });
    });

    engineRef.current = engine;
    sceneRef.current = scene;
    themeColors.current = colors;
    postProcessingRef.current = pipeline;
    cameraRef.current = camera;

    // Set paddle positions
    player1Ref.current.position.x = -20;
    player2Ref.current.position.x = 19.5;

    setLastTheme(theme); // Save current theme

    const sparkCleanUp = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);
    sparkEffectsRef.current = sparkCleanUp;

    const retroEffects = createPongRetroEffects(scene, camera, 'default');
    retroEffectsRef.current = retroEffects;

    setTimeout(() => {
      if (retroEffectsRef.current) {
        retroEffectsRef.current.simulateCRTTurnOn(2500).then(() => {});
      }
    }, 100);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      const timeout = 1500;

      if (retroEffectsRef.current) retroEffectsRef.current.simulateCRTTurnOff(timeout);

      window.removeEventListener('resize', handleResize);

      setTimeout(() => {
        if (sparkEffectsRef.current) sparkEffectsRef.current(0, 0);
        if (retroEffectsRef.current) retroEffectsRef.current.dispose();
        engine.dispose();
        scene.dispose();
      }, timeout);
    };
  }, []);

  // Update game objects
  useEffect(() => {
    if (!canvasRef.current || !themeColors.current) return;

    const { players, ball } = gameState;
    const color = themeColors.current.primaryColor;

    // Convert coordinates to Babylon coordinate system
    const player1Y = -((players.player1.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR) - FIX_POSITION;
    const player2Y = -((players.player2.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR) - FIX_POSITION;
    const ballY = -((ball.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR);
    const ballX = (ball.x - CANVAS_WIDTH / 2) / SCALE_FACTOR;

    // Update mesh positions directly
    player1Ref.current.position.y = player1Y;
    player2Ref.current.position.y = player2Y;
    ballRef.current.position.x = ballX;
    ballRef.current.position.y = ballY;

    // Calculate current speed and angle, detect collision and score
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);
    const collision = detectCollision(
      prevBallState.current.dx,
      prevBallState.current.dy,
      ball.dx,
      ball.dy
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
      applyCollisionEffects(
        retroEffectsRef.current,
        ballRef.current,
        player1Ref.current,
        player2Ref.current,
        collision,
        speed,
        color
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
  }, [gameState]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default GameCanvas;
