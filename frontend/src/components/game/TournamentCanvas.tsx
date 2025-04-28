import React, { useEffect, useRef } from 'react';

import { ArcRotateCamera, Color3, Engine, Mesh, Scene } from 'babylonjs';

import {
  applyBallEffects,
  applyCollisionEffects,
  applyScoreEffects,
  createBall,
  createEdge,
  createFloor,
  createPaddle,
  detectCollision,
  detectScore,
  enableRequiredExtensions,
  gameToSceneX,
  gameToSceneY,
  getThemeColorsFromDOM,
  setupSceneCamera,
  applyLowQualitySettings,
} from '@game/utils';

import { GameState, GameStatus, defaultGameObjectParams, defaultGameParams } from '@shared/types';

interface TournamentCanvasProps {
  gameState: GameState;
  gameStatus: GameStatus;
  theme?: 'light' | 'dark';
}

const TournamentCanvas: React.FC<TournamentCanvasProps> = ({
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

  const isAnimatingBallRef = useRef<boolean>(false);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });

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

  // initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, gameboardColor } = colors;

    const camera = setupSceneCamera(scene);

    applyLowQualitySettings(scene, 5.0, null, null);
    enableRequiredExtensions(engine);

    engineRef.current = engine;
    sceneRef.current = scene;
    cameraRef.current = camera;
    themeColors.current = colors;

    floorRef.current = createFloor(scene, gameboardColor);
    topEdgeRef.current = createEdge(scene, primaryColor);
    bottomEdgeRef.current = createEdge(scene, primaryColor);
    player1Ref.current = createPaddle(scene, primaryColor);
    player2Ref.current = createPaddle(scene, primaryColor);
    ballRef.current = createBall(scene, primaryColor);

    topEdgeRef.current.position.x = gameToSceneX(0, topEdgeRef.current);
    topEdgeRef.current.position.y = gameToSceneY(-10, topEdgeRef.current);
    bottomEdgeRef.current.position.x = gameToSceneX(0, bottomEdgeRef.current);
    bottomEdgeRef.current.position.y = gameToSceneY(gameHeight + 2, bottomEdgeRef.current);

    setupRenderLoop(engine, scene);

    const handleResize = () => {
      if (engineRef.current) {
        engineRef.current.resize();
        if (sceneRef.current) {
          setupRenderLoop(engineRef.current, sceneRef.current);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (engineRef.current) engineRef.current.renderEvenInBackground = false;
      } else {
        if (engineRef.current && sceneRef.current) {
          engineRef.current.renderEvenInBackground = true;
          setupRenderLoop(engineRef.current, sceneRef.current);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      engine.dispose();
      scene.dispose();
    };
  }, []);

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

    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);

    applyBallEffects(ballRef.current, speed, angle, ball.spin, primaryColor);

    const collisionType = detectCollision(prevBallState.current.dx, ball.dx, ball.y);

    if (collisionType) {
      const paddleToRecoil = ball.dx > 0 ? player1Ref.current : player2Ref.current;
      const edgeToDeform = ball.dy > 0 ? topEdgeRef.current : bottomEdgeRef.current;

      applyCollisionEffects(
        null, // no retro effects
        ballRef.current,
        paddleToRecoil,
        edgeToDeform,
        collisionType,
        speed,
        ball.spin,
        primaryColor,
        true,
        null // no sounds
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

      isAnimatingBallRef.current = true;

      applyScoreEffects(
        null, // no retro effects
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
        null // no sounds
      );
    }

    // Remove condition if no score effects
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

export default TournamentCanvas;
