import React, { useEffect, useRef, useState } from 'react';

import {
  ArcRotateCamera,
  Vector3,
  Color3,
  DefaultRenderingPipeline,
  Engine,
  Scene,
} from 'babylonjs';

import {
  RetroEffectsManager,
  PowerUpEffectsManager,
  applyBallEffects,
  applyCollisionEffects,
  applyPlayerEffects,
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
  setupEnvironmentMap,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import {
  GameState,
  PowerUp,
  RetroEffectsLevels,
  defaultRetroEffectsLevels,
  defaultGameParams,
  defaultGameObjectParams,
} from '@shared/types';

interface GameCanvasProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
  retroPreset?: 'default' | 'cinematic';
  retroLevels?: RetroEffectsLevels;
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
  const gameHeight = defaultGameParams.gameHeight;
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

const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  theme = 'dark',
  retroPreset = 'default',
  retroLevels = defaultRetroEffectsLevels,
}) => {
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
  const retroLevelsRef = useRef<RetroEffectsLevels>(retroLevels);

  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const powerUpEffectsRef = useRef<PowerUpEffectsManager | null>(null);
  const prevPowerUpsRef = useRef<PowerUp[]>([]);

  const floorRef = useRef<any>(null);
  const topEdgeRef = useRef<any>(null);
  const bottomEdgeRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  const gameWidth = defaultGameParams.gameWidth;
  const gameHeight = defaultGameParams.gameHeight;

  // initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    setupEnvironmentMap(scene);

    const camera = setupSceneCamera(scene);
    const pipeline = setupPostProcessing(scene, camera, false);
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

    powerUpEffectsRef.current = new PowerUpEffectsManager(
      scene,
      colors.primaryColor,
      defaultGameParams.powerUpSize
    );

    setLastTheme(theme); // Save current theme

    sparkEffectsRef.current = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);
    retroEffectsRef.current = createPongRetroEffects(scene, camera, retroPreset, retroLevels);
    retroLevelsRef.current = retroLevels;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (powerUpEffectsRef.current) powerUpEffectsRef.current.disposeAll();
      if (sparkEffectsRef.current) sparkEffectsRef.current(0, 0);
      if (retroEffectsRef.current) retroEffectsRef.current.dispose();
      engine.dispose();
      scene.dispose();
    };
  }, []);

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

  // Handle power-up updates
  useEffect(() => {
    if (!powerUpEffectsRef.current || !gameState) return;

    const powerUps = gameState.powerUps || [];
    const powerUpsChanged = JSON.stringify(powerUps) !== JSON.stringify(prevPowerUpsRef.current);

    if (powerUpsChanged) {
      powerUpEffectsRef.current.updatePowerUpEffects(powerUps);
      prevPowerUpsRef.current = [...powerUps];
    }
  }, [gameState]);

  // Handle game object updates
  useEffect(() => {
    if (!canvasRef.current || !themeColors.current) return;

    const { players, ball, powerUps } = gameState;
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
        true
      );
    }

    if (score) applyScoreEffects(retroEffectsRef.current);

    if (sceneRef.current && powerUps && powerUps.length > 0) {
      applyPlayerEffects(
        sceneRef.current,
        player1Ref.current,
        player2Ref.current,
        players,
        powerUps,
        color
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

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default GameCanvas;
