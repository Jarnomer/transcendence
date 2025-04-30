import React, { useEffect, useRef } from 'react';

import {
  ArcRotateCamera,
  BlurPostProcess,
  Color3,
  DefaultRenderingPipeline,
  Engine,
  Mesh,
  Scene,
} from 'babylonjs';

import {
  ActivePowerUpIconManager,
  GameAnimationManager,
  GameSoundManager,
  GameTextManager,
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
  createGameTextManager,
  createPaddle,
  createPongRetroEffects,
  detectCollision,
  detectScore,
  enableRequiredExtensions,
  gameToSceneX,
  gameToSceneY,
  getGameSoundManager,
  getThemeColorsFromDOM,
  setupBlurEffect,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import {
  GameState,
  GameStatus,
  PlayerEffects,
  PowerUp,
  RetroEffectsLevels,
  defaultGameObjectParams,
  defaultGameParams,
  defaultRetroEffectsBaseParams,
  defaultRetroEffectsLevels,
  retroEffectsPresets,
} from '@shared/types';

interface GameplayCanvasProps {
  gameState: GameState;
  gameStatus: GameStatus;
  theme?: 'light' | 'dark';
}

const GameplayCanvas: React.FC<GameplayCanvasProps> = ({
  gameState,
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
  const sparkEffectsRef = useRef<((speed: number, spin: number) => void) | null>(null);
  const retroEffectsRef = useRef<RetroEffectsManager | null>(null);
  const retroLevelsRef = useRef<RetroEffectsLevels>(defaultRetroEffectsLevels);
  const textManagerRef = useRef<GameTextManager>(null);

  const blurEffectsRef = useRef<{
    horizontalBlur: BlurPostProcess;
    verticalBlur: BlurPostProcess;
  } | null>(null);

  const isAnimatingBallRef = useRef<boolean>(false);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const prevCountdownRef = useRef<number | undefined>(undefined);
  const prevGameStatusRef = useRef<GameStatus | null>(null);

  const playerEffectsMapRef = useRef<Map<number, PlayerEffects>>(new Map());
  const powerUpEffectsRef = useRef<PowerUpEffectsManager | null>(null);
  const powerUpIconsRef = useRef<ActivePowerUpIconManager | null>(null);
  const prevPowerUpsRef = useRef<PowerUp[]>([]);

  const floorRef = useRef<Mesh | null>(null);
  const topEdgeRef = useRef<Mesh | null>(null);
  const bottomEdgeRef = useRef<Mesh | null>(null);
  const player1Ref = useRef<Mesh | null>(null);
  const player2Ref = useRef<Mesh | null>(null);
  const ballRef = useRef<Mesh | null>(null);

  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const gameHeight = defaultGameParams.dimensions.gameHeight;

  // initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    GameAnimationManager.getInstance(scene);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, thirdColor, gameboardColor } = colors;

    const camera = setupSceneCamera(scene);

    const pipeline = setupPostProcessing(scene, camera, true);
    const blurEffects = setupBlurEffect(camera);

    const { shadowGenerators } = setupScenelights(scene, primaryColor);

    enableRequiredExtensions(engine);

    soundManagerRef.current = getGameSoundManager();
    textManagerRef.current = createGameTextManager(scene, thirdColor, camera);

    retroLevelsRef.current = retroEffectsPresets.default;
    retroEffectsRef.current = createPongRetroEffects(
      scene,
      camera,
      'default',
      retroLevelsRef.current,
      defaultRetroEffectsBaseParams
    );

    engineRef.current = engine;
    sceneRef.current = scene;
    cameraRef.current = camera;
    themeColors.current = colors;
    postProcessingRef.current = pipeline;
    blurEffectsRef.current = blurEffects;

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

    powerUpEffectsRef.current = new PowerUpEffectsManager(
      scene,
      colors.primaryColor,
      colors.secondaryColor,
      defaultGameParams.powerUps.size,
      soundManagerRef.current
    );

    powerUpIconsRef.current = new ActivePowerUpIconManager(
      scene,
      colors.primaryColor,
      colors.secondaryColor,
      soundManagerRef.current
    );

    sparkEffectsRef.current = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);

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
      if (powerUpIconsRef.current) powerUpIconsRef.current.disposeAll();
      if (sparkEffectsRef.current) sparkEffectsRef.current(0, 0);
      if (retroEffectsRef.current) retroEffectsRef.current.dispose();
      if (textManagerRef.current) textManagerRef.current.dispose();

      if (blurEffectsRef.current) {
        if (blurEffectsRef.current.horizontalBlur) blurEffectsRef.current.horizontalBlur.dispose();
        if (blurEffectsRef.current.verticalBlur) blurEffectsRef.current.verticalBlur.dispose();
      }

      engine.dispose();
      scene.dispose();
    };
  }, []);

  // Handle game power-ups
  useEffect(() => {
    if (!powerUpEffectsRef.current || !gameState) return;

    const powerUps = gameState.powerUps || [];
    const powerUpsChanged = JSON.stringify(powerUps) !== JSON.stringify(prevPowerUpsRef.current);

    if (powerUpsChanged) {
      powerUpEffectsRef.current.updatePowerUpEffects(powerUps);
      prevPowerUpsRef.current = [...powerUps];
    }
  }, [gameState]);

  // Handle text effects
  useEffect(() => {
    if (!textManagerRef.current || !gameState) return;

    if (prevGameStatusRef.current !== gameStatus) {
      textManagerRef.current.handleGameStatus(
        gameStatus,
        prevGameStatusRef.current,
        gameState.countdown
      );
      prevGameStatusRef.current = gameStatus;
    } else if (
      gameStatus === 'countdown' &&
      gameState.countdown !== undefined &&
      gameState.countdown <= 3 &&
      gameState.countdown !== prevCountdownRef.current
    ) {
      textManagerRef.current.handleGameStatus(
        gameStatus,
        prevGameStatusRef.current,
        gameState.countdown
      );
      prevCountdownRef.current = gameState.countdown;
    }
  }, [gameStatus, gameState]);

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
    const secondaryColor = themeColors.current.secondaryColor;

    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);

    const collisionType =
      gameStatus === 'playing' ? detectCollision(prevBallState.current.dx, ball.dx, ball.y) : null;

    const scoringPlayer = detectScore(
      players.player1.score,
      players.player2.score,
      lastScoreRef.current,
      ball.dx
    );

    applyBallEffects(ballRef.current, speed, angle, ball.spin, primaryColor);

    if (sparkEffectsRef.current) sparkEffectsRef.current(speed, ball.spin);

    if (collisionType) {
      const paddleToRecoil = ball.dx > 0 ? player1Ref.current : player2Ref.current;
      const edgeToDeform = ball.dy > 0 ? topEdgeRef.current : bottomEdgeRef.current;

      applyCollisionEffects(
        retroEffectsRef.current,
        ballRef.current,
        paddleToRecoil,
        edgeToDeform,
        collisionType,
        speed,
        ball.spin,
        primaryColor,
        true,
        soundManagerRef.current
      );
    }

    if (scoringPlayer) {
      const scoringPlayerPaddle =
        scoringPlayer === 'player1' ? player1Ref.current : player2Ref.current;
      const scoredAgainstPaddle =
        scoringPlayer === 'player1' ? player2Ref.current : player1Ref.current;

      isAnimatingBallRef.current = true;

      applyScoreEffects(
        retroEffectsRef.current,
        sceneRef.current,
        cameraRef.current,
        topEdgeRef.current,
        bottomEdgeRef.current,
        scoringPlayerPaddle,
        scoredAgainstPaddle,
        ballRef.current,
        players[scoringPlayer].score,
        speed,
        ball,
        primaryColor,
        gameWidth,
        gameHeight,
        () => {
          isAnimatingBallRef.current = false;
        },
        soundManagerRef.current
      );
    }

    applyPlayerEffects(
      sceneRef.current,
      player1Ref.current,
      player2Ref.current,
      players,
      primaryColor,
      secondaryColor,
      playerEffectsMapRef.current
    );

    if (powerUpIconsRef.current) {
      powerUpIconsRef.current.updatePowerUpDisplays({
        player1: gameState.players.player1,
        player2: gameState.players.player2,
      });
    }

    if (!isAnimatingBallRef.current) {
      player1Ref.current.position.x = gameToSceneX(0, player1Ref.current);
      player1Ref.current.position.y = gameToSceneY(players.player1.y, player1Ref.current);
      player2Ref.current.position.x = gameToSceneX(gameWidth, player2Ref.current);
      player2Ref.current.position.y = gameToSceneY(players.player2.y, player2Ref.current);
      ballRef.current.position.x = gameToSceneX(ball.x, ballRef.current);
      ballRef.current.position.y = gameToSceneY(ball.y, ballRef.current);
      ballRef.current.position.z = defaultGameObjectParams.distanceFromFloor;
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

export default GameplayCanvas;
