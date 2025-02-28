import React, { useRef, useEffect } from 'react';
import { Engine, Scene, FreeCamera, HemisphericLight,
  MeshBuilder, StandardMaterial, Color3, Vector3 } from 'babylonjs';

interface GameCanvasProps {
  websocket: WebSocket | null;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ websocket }) => {

  // Core references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  // Game references
  const player1Ref = useRef({ mesh: null, y: 0 });
  const player2Ref = useRef({ mesh: null, y: 0 });
  const ballRef = useRef({ mesh: null, x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !websocket) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    engineRef.current = engine;
    sceneRef.current = scene;

    // Setup camera
    const camera = new FreeCamera("camera", new Vector3(0, 0, -24), scene);
    camera.setTarget(Vector3.Zero());
    camera.detachControl();

    // camera.attachControl(canvas, true);

    // Setup light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    

    // Setup material
    const paddleMaterial = new StandardMaterial("paddleMat", scene);
    paddleMaterial.diffuseColor = Color3.White();

    // Create paddles
    player1Ref.current.mesh = MeshBuilder.CreateBox("paddle1", {
      height: 4, width: 0.5, depth: 0.5
    }, scene);
    player2Ref.current.mesh = MeshBuilder.CreateBox("paddle2", {
      height: 4, width: 0.5, depth: 0.5
    }, scene);

    // Create ball
    ballRef.current.mesh = MeshBuilder.CreateSphere("ball", {
      diameter: 0.5
    }, scene);

    // Position paddles
    player1Ref.current.mesh.position.x = -20;
    player2Ref.current.mesh.position.x = 20;

    // Apply materials
    player1Ref.current.mesh.material = paddleMaterial;
    player2Ref.current.mesh.material = paddleMaterial;
    ballRef.current.mesh.material = paddleMaterial;

    // Scene render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
      scene.dispose();
    };
  }, [websocket]);

  // Handle position changes
  useEffect(() => {
    if (!websocket) return;
    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'update') {

        // Fixed values to fix positins, change to dynamic later
        const CANVAS_WIDTH = 800;
        const CANVAS_HEIGHT = 400;
        const SCALE_FACTOR = 20;
        const FIX_POSTION = 2;

        // Convert player1's y position (from top-left to center-origin)
        // 1. Subtract half the canvas height to center (y increases downward in 2D)
        // 2. Negate the result (because y increases upward in Babylon)
        // 3. Scale down by dividing and shift down based on paddle size
        // For ball, similar conversion, but x-coordinates don't need to be negated

        const player1Y = -((data.state.players.player1.y - CANVAS_HEIGHT/2) / SCALE_FACTOR) - FIX_POSTION;
        const player2Y = -((data.state.players.player2.y - CANVAS_HEIGHT/2) / SCALE_FACTOR) - FIX_POSTION;
        const ballY = -((data.state.ball.y - CANVAS_HEIGHT/2) / SCALE_FACTOR);
        const ballX = (data.state.ball.x - CANVAS_WIDTH/2) / SCALE_FACTOR;

        player1Ref.current.mesh.position.y = player1Y;
        player2Ref.current.mesh.position.y = player2Y;
        ballRef.current.mesh.position.x = ballX;
        ballRef.current.mesh.position.y = ballY;
      }
    };

    websocket.addEventListener('message', handleMessage);

    return () => {
      websocket.removeEventListener('message', handleMessage);
    };
  }, [websocket]);  // Only re-run if the websocket changes

  // Handle key presses
  useEffect(() => {
    if (!websocket) return;
    
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'w' || event.key === 'W') {
        websocket.send(JSON.stringify({ type: 'move', playerId: 'player1', move: 'up' }));
      } else if (event.key === 's' || event.key === 'S') {
        websocket.send(JSON.stringify({ type: 'move', playerId: 'player1', move: 'down' }));
      } else if (event.key === 'ArrowUp') {
        websocket.send(JSON.stringify({ type: 'move', playerId: 'player2', move: 'up' }));
      } else if (event.key === 'ArrowDown') {
        websocket.send(JSON.stringify({ type: 'move', playerId: 'player2', move: 'down' }));
      }
    };

    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [websocket]);  // Only re-run if the websocket changes

  return <canvas ref={canvasRef} className="game-canvas" style={{ width: '100%', height: '100%' }} />;
};

export default GameCanvas;
