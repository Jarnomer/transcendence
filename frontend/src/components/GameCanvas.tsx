import React, { useRef, useEffect } from 'react';
import { Engine, Scene, FreeCamera, HemisphericLight,
  MeshBuilder, StandardMaterial, Color3, Vector3 } from 'babylonjs';

interface GameCanvasProps {
  gameState: { 
    players: Record<string, { id: string; y: number; score: number }>;
    ball: { x: number; y: number; dx: number; dy: number };
  };
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {

  // Babylon references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  // Game references
  const player1Ref = useRef<{ mesh: any; y: number }>({ mesh: null, y: 0 });
  const player2Ref = useRef<{ mesh: any; y: number }>({ mesh: null, y: 0 });
  const ballRef = useRef<{ mesh: any; x: number; y: number }>({ mesh: null, x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    engineRef.current = engine;
    sceneRef.current = scene;

    // Setup camera
    const camera = new FreeCamera("camera", new Vector3(0, 0, -24), scene);
    camera.setTarget(Vector3.Zero());
    camera.detachControl();

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

    // Add event listener for resize
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
      scene.dispose();
    };
  }, []); // Runs only once on mount

  // Handle position changes
  useEffect(() => {
    if (!gameState) return;

    // Fixed values for now, change to dynamic later
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 400;
    const SCALE_FACTOR = 20;
    const FIX_POSITION = 2;

    // Convert player y-coordinates (from top-left to center-origin)
    // For ball, similar conversions, but x-coordinate needs no negation
    // 1. Subtract half the canvas height to center (y increases downward in 2D)
    // 2. Negate the result (because y increases upward in Babylon)
    // 3. Scale down by dividing and shift down based on paddle size

    const player1Y = -((gameState.players.player1.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR) - FIX_POSITION;
    const player2Y = -((gameState.players.player2.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR) - FIX_POSITION;
    const ballY = -((gameState.ball.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR);
    const ballX = (gameState.ball.x - CANVAS_WIDTH / 2) / SCALE_FACTOR;

    player1Ref.current.mesh.position.y = player1Y;
    player2Ref.current.mesh.position.y = player2Y;
    ballRef.current.mesh.position.x = ballX;
    ballRef.current.mesh.position.y = ballY;

  }, [gameState]); // Runs whenever gameState changes

  return <canvas ref={canvasRef} className="game-canvas" style={{ width: '800px', height: '400px' }} />;
};

export default GameCanvas;
