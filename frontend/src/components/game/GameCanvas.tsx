import React, { useEffect, useRef, useState } from 'react';

import { ArcRotateCamera, Color3, DefaultRenderingPipeline, Engine, Scene } from 'babylonjs';

import { GameState } from '@shared/types';

import {
  applyBallEffects,
  applyCollisionEffects,
  applyCollisionFlash,
  ballSparkEffect,
  createBall,
  createFloor,
  createPaddle,
  detectCollision,
  getThemeColors,
  setupCRTEffect,
  setupEnvironmentMap,
  setupGlitchEffect,
  setupPostProcessing,
  setupReflections,
  setupScanlinesEffect,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

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
  const sparkEffectCleanupRef = useRef<((speed: number, spin: number) => void) | null>(null);

  // Store custom effects
  const effectsRef = useRef<{
    crtEffect?: any;
    glitchEffect?: { effect: any; setGlitchAmount: (amount: number) => void };
    scanlinesEffect?: any;
    lastScore?: number;
  }>({});

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

    setupEnvironmentMap(scene);

    const camera = setupSceneCamera(scene);
    const pipeline = setupPostProcessing(scene, camera);
    const { shadowGenerators } = setupScenelights(scene);

    // Set up custom effects
    effectsRef.current.crtEffect = setupCRTEffect(scene, camera);
    effectsRef.current.glitchEffect = setupGlitchEffect(scene, camera);
    effectsRef.current.scanlinesEffect = setupScanlinesEffect(scene, camera);

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

    // Initialize previous ball state
    prevBallState.current = {
      x: gameState.ball.x,
      y: gameState.ball.y,
      dx: gameState.ball.dx,
      dy: gameState.ball.dy,
      spin: gameState.ball.spin,
    };

    setLastTheme(theme); // Save current theme

    const sparkCleanUp = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);

    sparkEffectCleanupRef.current = sparkCleanUp;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sparkEffectCleanupRef.current) sparkEffectCleanupRef.current(0, 0);
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

    // Calculate current speed, detect collision
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);
    const collision = detectCollision(
      prevBallState.current.dx,
      prevBallState.current.dy,
      ball.dx,
      ball.dy
    );

    applyBallEffects(ballRef.current, speed, angle, ball.spin, color);

    if (sparkEffectCleanupRef.current) sparkEffectCleanupRef.current(speed, ball.spin);

    if (collision) {
      applyCollisionEffects(
        ballRef.current,
        player1Ref.current,
        player2Ref.current,
        collision,
        speed,
        color
      );

      // Apply collision flash
      if (postProcessingRef.current) {
        applyCollisionFlash(postProcessingRef.current, 0.2, 100);
      }

      // Apply glitch on collision
      if (effectsRef.current.glitchEffect) {
        effectsRef.current.glitchEffect.setGlitchAmount(0.2);
        setTimeout(() => {
          if (effectsRef.current.glitchEffect) {
            effectsRef.current.glitchEffect.setGlitchAmount(0);
          }
        }, 200);
      }
    }

    // Check for score change
    // const totalScore = (score?.player1 || 0) + (score?.player2 || 0);
    // if (score && totalScore !== effectsRef.current.lastScore) {
    //   effectsRef.current.lastScore = totalScore;

    //   // Apply score effect if pipeline exists
    //   if (postProcessingRef.current && ballRef.current) {
    //     const scorePosition = ballRef.current.position.clone();
    //     applyScoreEffects(scene, postProcessingRef.current, scorePosition);

    //     // Apply intense glitch on score
    //     if (effectsRef.current.glitchEffect) {
    //       effectsRef.current.glitchEffect.setGlitchAmount(0.8);
    //       setTimeout(() => {
    //         if (effectsRef.current.glitchEffect) {
    //           effectsRef.current.glitchEffect.setGlitchAmount(0);
    //         }
    //       }, 1000);
    //     }
    //   }
    // }

    prevBallState.current = {
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
      spin: ball.spin,
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
