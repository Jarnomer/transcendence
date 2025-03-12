import React, { useEffect, useRef } from 'react';

import {
  Color3,
  Color4,
  Engine,
  FreeCamera,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
} from 'babylonjs';

import { GameState } from '@shared/types';
import { parseColor } from '@shared/utils';

interface GameCanvasProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
}

// Fixed values for now, change to dynamic later, maybe?
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const SCALE_FACTOR = 20;
const FIX_POSITION = 2;

// Get theme colors from CSS variables
const getThemeColors = (theme: 'light' | 'dark' = 'dark') => {
  // Get computed styles from document
  const computedStyle = getComputedStyle(document.documentElement);

  // Use the data-theme attribute values from CSS
  document.documentElement.setAttribute('data-theme', theme);

  // Get color values from CSS variables
  const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
  const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim();
  const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();

  // Parse colors to Babylon Color3 format
  return {
    primaryColor: parseColor(primaryColor || '#ea355a'),
    secondaryColor: parseColor(secondaryColor || 'oklch(8% 0% 0)'),
    backgroundColor: parseColor(backgroundColor || 'black'),
  };
};

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  const player1Ref = useRef<{ mesh: any; y: number }>({ mesh: null, y: 0 });
  const player2Ref = useRef<{ mesh: any; y: number }>({ mesh: null, y: 0 });
  const ballRef = useRef<{ mesh: any; x: number; y: number }>({ mesh: null, x: 0, y: 0 });

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    // Get colors from current theme
    const { primaryColor, secondaryColor, backgroundColor } = getThemeColors(theme);

    // Set background color
    scene.clearColor = new Color4(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);

    engineRef.current = engine;
    sceneRef.current = scene;

    // Setup camera
    const camera = new FreeCamera('camera', new Vector3(0, 0, -24), scene);
    camera.setTarget(Vector3.Zero());
    camera.detachControl();

    // Setup light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Setup materials with your theme colors
    const player1Material = new StandardMaterial('player1Mat', scene);
    player1Material.diffuseColor = primaryColor;
    player1Material.emissiveColor = new Color3(
      primaryColor.r * 0.5,
      primaryColor.g * 0.5,
      primaryColor.b * 0.5
    );

    const player2Material = new StandardMaterial('player2Mat', scene);
    player2Material.diffuseColor = primaryColor;
    player2Material.emissiveColor = new Color3(
      primaryColor.r * 0.5,
      primaryColor.g * 0.5,
      primaryColor.b * 0.5
    );

    const ballMaterial = new StandardMaterial('ballMat', scene);
    ballMaterial.diffuseColor = primaryColor;
    ballMaterial.emissiveColor = new Color3(
      primaryColor.r * 0.7,
      primaryColor.g * 0.7,
      primaryColor.b * 0.7
    );
    ballMaterial.specularPower = 64;

    // Create paddles
    player1Ref.current.mesh = MeshBuilder.CreateBox(
      'paddle1',
      {
        height: 4,
        width: 0.5,
        depth: 0.5,
      },
      scene
    );
    player2Ref.current.mesh = MeshBuilder.CreateBox(
      'paddle2',
      {
        height: 4,
        width: 0.5,
        depth: 0.5,
      },
      scene
    );

    // Create ball
    ballRef.current.mesh = MeshBuilder.CreateSphere(
      'ball',
      {
        diameter: 0.8,
        segments: 16,
      },
      scene
    );

    // Position paddles
    player1Ref.current.mesh.position.x = -20;
    player2Ref.current.mesh.position.x = 20;

    // Apply materials
    player1Ref.current.mesh.material = player1Material;
    player2Ref.current.mesh.material = player2Material;
    ballRef.current.mesh.material = ballMaterial;

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
  }, [theme]);

  // Apply theme change without recreating the scene
  useEffect(() => {
    if (
      !sceneRef.current ||
      !player1Ref.current.mesh ||
      !player2Ref.current.mesh ||
      !ballRef.current.mesh
    )
      return;

    const { primaryColor, secondaryColor, backgroundColor } = getThemeColors(theme);

    // Update scene background
    sceneRef.current.clearColor = new Color4(
      backgroundColor.r,
      backgroundColor.g,
      backgroundColor.b,
      1
    );

    // Update material colors
    if (player1Ref.current.mesh.material) {
      const material = player1Ref.current.mesh.material as StandardMaterial;
      material.diffuseColor = primaryColor;
      material.emissiveColor = new Color3(
        primaryColor.r * 0.5,
        primaryColor.g * 0.5,
        primaryColor.b * 0.5
      );
    }

    if (player2Ref.current.mesh.material) {
      const material = player2Ref.current.mesh.material as StandardMaterial;
      material.diffuseColor = primaryColor;
      material.emissiveColor = new Color3(
        primaryColor.r * 0.5,
        primaryColor.g * 0.5,
        primaryColor.b * 0.5
      );
    }

    if (ballRef.current.mesh.material) {
      const material = ballRef.current.mesh.material as StandardMaterial;
      material.diffuseColor = primaryColor;
      material.emissiveColor = new Color3(
        primaryColor.r * 0.7,
        primaryColor.g * 0.7,
        primaryColor.b * 0.7
      );
    }
  }, [theme]);

  // Handle position changes
  useEffect(() => {
    if (!canvasRef.current || !gameState || !player1Ref.current.mesh) return;

    const player1 = gameState.players.player1;
    const player2 = gameState.players.player2;
    const ball = gameState.ball;

    // Convert coordinates
    const player1Y = -((player1.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR) - FIX_POSITION;
    const player2Y = -((player2.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR) - FIX_POSITION;
    const ballY = -((ball.y - CANVAS_HEIGHT / 2) / SCALE_FACTOR);
    const ballX = (ball.x - CANVAS_WIDTH / 2) / SCALE_FACTOR;

    player1Ref.current.mesh.position.y = player1Y;
    player2Ref.current.mesh.position.y = player2Y;
    ballRef.current.mesh.position.x = ballX;
    ballRef.current.mesh.position.y = ballY;
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
