import React, { useEffect, useRef, useState } from 'react';

import { ArcRotateCamera, Color3, DefaultRenderingPipeline, Engine, Scene } from 'babylonjs';

import { GameState } from '@shared/types';
import {
  applyBallEffects,
  applyCollisionEffects,
  createBall,
  createFloor,
  createPaddle,
  getThemeColors,
  setupPostProcessing,
  setupSceneCamera,
  setupSceneEnvironment,
  setupScenelights,
} from '@shared/utils';

interface GameCanvasProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
}

// Fixed values for now, change to dynamic later, maybe?
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const SCALE_FACTOR = 20;
const FIX_POSITION = 2.25;

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

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, theme = 'dark' }) => {
  const [lastTheme, setLastTheme] = useState(theme);

  const prevBallState = useRef({ x: 0, y: 0, dx: 0, dy: 0 });
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

  // Updated references to only store mesh objects
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

    setupSceneEnvironment(scene);
    setupScenelights(scene);

    const camera = setupSceneCamera(scene);
    const pipeline = setupPostProcessing(scene, camera);

    floorRef.current = createFloor(scene, backgroundColor);
    player1Ref.current = createPaddle(scene, primaryColor);
    player2Ref.current = createPaddle(scene, primaryColor);
    ballRef.current = createBall(scene, primaryColor);

    engineRef.current = engine;
    sceneRef.current = scene;
    themeColors.current = colors;
    postProcessingRef.current = pipeline;
    cameraRef.current = camera;

    // Set paddle positions
    player1Ref.current.position.x = -20;
    player2Ref.current.position.x = 19.7;

    // Initialize previous ball state
    prevBallState.current = {
      x: gameState.ball.x,
      y: gameState.ball.y,
      dx: gameState.ball.dx,
      dy: gameState.ball.dy,
    };

    setLastTheme(theme); // Save current theme

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      scene.dispose();
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

    // Update constant ball effects, inverted dy for Babylon coordinate system
    applyBallEffects(ballRef.current, ball.dx, -ball.dy, color);

    // Check for collisions by comparing current and previous velocity
    if (prevBallState.current.dx !== 0 || prevBallState.current.dy !== 0) {
      applyCollisionEffects(
        ballRef.current,
        player1Ref.current,
        player2Ref.current,
        prevBallState.current.dx,
        prevBallState.current.dy,
        ball.dx,
        ball.dy,
        color
      );
    }

    // Update previous state for next frame
    prevBallState.current = {
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
    };
  }, [gameState]);

  return (
    <canvas
      ref={canvasRef}
      className="game-canvas glass-box"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default GameCanvas;
