import React, { useEffect, useRef, useState } from 'react';

import {
  Animation,
  ArcRotateCamera,
  Color3,
  CubicEase,
  DefaultRenderingPipeline,
  Engine,
  EasingFunction,
  Mesh,
  Scene,
  Vector3,
} from 'babylonjs';

import {
  PowerUpEffectsManager,
  RetroEffectsManager,
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
  enableRequiredExtensions,
  gameToSceneX,
  gameToSceneY,
  getThemeColors,
  setupEnvironmentMap,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import {
  Ball,
  GameState,
  PowerUp,
  RetroEffectsLevels,
  defaultGameParams,
  defaultRetroEffectsLevels,
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

  const isAnimatingBallRef = useRef<boolean>(false);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const powerUpEffectsRef = useRef<PowerUpEffectsManager | null>(null);
  const prevPowerUpsRef = useRef<PowerUp[]>([]);

  const floorRef = useRef<any>(null);
  const topEdgeRef = useRef<any>(null);
  const bottomEdgeRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const gameHeight = defaultGameParams.dimensions.gameHeight;

  const animateBallAfterScore = (
    scene: Scene,
    ballMesh: Mesh,
    ballState: Ball,
    camera: ArcRotateCamera,
    scoringPlayer: 'player1' | 'player2',
    gameWidth: number = defaultGameParams.dimensions.gameWidth,
    gameHeight: number = defaultGameParams.dimensions.gameHeight,
    scaleFactor: number = defaultGameParams.dimensions.scaleFactor
  ) => {
    isAnimatingBallRef.current = true;

    const ballX = ballMesh.position.x;
    const ballY = ballMesh.position.y;
    const ballZ = ballMesh.position.z;

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

  // initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    enableRequiredExtensions(engine);
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

    topEdgeRef.current.position.x = gameToSceneX(0, topEdgeRef.current);
    topEdgeRef.current.position.y = gameToSceneY(-10, topEdgeRef.current);
    bottomEdgeRef.current.position.x = gameToSceneX(0, bottomEdgeRef.current);
    bottomEdgeRef.current.position.y = gameToSceneY(gameHeight + 2, bottomEdgeRef.current);

    powerUpEffectsRef.current = new PowerUpEffectsManager(
      scene,
      colors.primaryColor,
      colors.secondaryColor,
      defaultGameParams.powerUps.size
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
    if (!canvasRef.current || !sceneRef.current || !cameraRef.current || !themeColors.current)
      return;

    const { players, ball } = gameState;
    const primaryColor = themeColors.current.primaryColor;
    const secondaryColor = themeColors.current.secondaryColor;

    // Convert coordinates to Babylon coordinate system
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
    const score = detectScore(
      players.player1.score,
      players.player2.score,
      lastScoreRef.current,
      ball.dx
    );

    applyBallEffects(ballRef.current, speed, angle, ball.spin, primaryColor);

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
        primaryColor,
        true
      );
    }

    if (score) {
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
        players,
        ball,
        primaryColor
      );
    }

    applyPlayerEffects(
      sceneRef.current,
      player1Ref.current,
      player2Ref.current,
      players,
      primaryColor,
      secondaryColor
    );

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
