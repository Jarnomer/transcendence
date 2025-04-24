import React, { useEffect, useRef } from 'react';

import {
  Animation,
  ArcRotateCamera,
  Color3,
  Color4,
  CubicEase,
  DefaultRenderingPipeline,
  EasingFunction,
  Engine,
  Mesh,
  Scene,
  Vector3,
} from 'babylonjs';

import {
  GameSoundManager,
  RetroEffectsManager,
  PowerUpEffectsManager,
  ActivePowerUpIconManager,
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
  detectCollision,
  detectScore,
  enableRequiredExtensions,
  gameToSceneX,
  gameToSceneY,
  getGameSoundManager,
  getThemeColorsFromDOM,
  parseColor,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import {
  Ball,
  GameState,
  GameStatus,
  PlayerEffects,
  PowerUp,
  RetroEffectsLevels,
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

  const isAnimatingBallRef = useRef<boolean>(false);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });

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
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    const bgColor = parseColor('#33353e');
    scene.clearColor = new Color4(bgColor.r, bgColor.g, bgColor.b, 1.0);

    soundManagerRef.current = getGameSoundManager();

    const camera = setupSceneCamera(scene);

    const pipeline = setupPostProcessing(scene, camera);

    const { shadowGenerators } = setupScenelights(scene, primaryColor);

    enableRequiredExtensions(engine);

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

    applyBallEffects(ballRef.current, speed, angle, ball.spin, primaryColor);

    if (sparkEffectsRef.current) sparkEffectsRef.current(speed, ball.spin);

    const collisionType =
      gameStatus === 'playing' ? detectCollision(prevBallState.current.dx, ball.dx, ball.y) : null;

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

    const scoringPlayer = detectScore(
      players.player1.score,
      players.player2.score,
      lastScoreRef.current,
      ball.dx
    );

    if (scoringPlayer) {
      const scoringPlayerPaddle =
        scoringPlayer === 'player1' ? player1Ref.current : player2Ref.current;
      const scoredAgainstPaddle =
        scoringPlayer === 'player1' ? player2Ref.current : player1Ref.current;

      animateBallAfterScore(
        sceneRef.current,
        ballRef.current,
        ball,
        cameraRef.current,
        scoringPlayer
      );

      applyScoreEffects(
        retroEffectsRef.current,
        sceneRef.current,
        cameraRef.current,
        topEdgeRef.current,
        bottomEdgeRef.current,
        scoringPlayerPaddle,
        scoredAgainstPaddle,
        players[scoringPlayer].score,
        speed,
        ball,
        primaryColor,
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
