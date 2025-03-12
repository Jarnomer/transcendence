import React, { useEffect, useRef, useState } from 'react';

import {
  ArcRotateCamera,
  Color3,
  Color4,
  CubeTexture,
  Engine,
  HemisphericLight,
  PBRMaterial,
  Scene,
  Vector3,
} from 'babylonjs';

import { GameState } from '@shared/types';
import { createBall, createFloor, createPaddle, getThemeColors } from '@shared/utils';

interface GameCanvasProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
}

// Fixed values for now, change to dynamic later, maybe?
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
  const [cameraControlEnabled, setCameraControlEnabled] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);

  const floorRef = useRef<any>(null);
  const player1Ref = useRef<{ mesh: any; y: number }>({ mesh: null, y: 0 });
  const player2Ref = useRef<{ mesh: any; y: number }>({ mesh: null, y: 0 });
  const ballRef = useRef<{ mesh: any; x: number; y: number }>({ mesh: null, x: 0, y: 0 });

  const toggleCameraControl = () => {
    if (!cameraRef.current) return;

    setCameraControlEnabled((prev) => {
      const newState = !prev;

      if (newState) {
        cameraRef.current!.attachControl(canvasRef.current!, true);
        console.log('Camera controls enabled');
      } else {
        cameraRef.current!.detachControl();
        console.log('Camera controls disabled');
      }

      return newState;
    });
  };

  // Handle key presses globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'c') {
        toggleCameraControl();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const { primaryColor, secondaryColor, backgroundColor } = getThemeColorsFromDOM(theme);

    scene.clearColor = new Color4(backgroundColor.r, backgroundColor.g, backgroundColor.b, 1);

    engineRef.current = engine;
    sceneRef.current = scene;

    try {
      scene.environmentTexture = CubeTexture.CreateFromPrefilteredData(
        '../assets/game/satara_night_4k.exr',
        scene
      );
      scene.environmentIntensity = 1.0;
    } catch (error) {
      console.error('Error loading environment map:', error);
    }

    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2, // horizontal rotation
      Math.PI / 2, // vertical rotation
      24, // distance from target
      new Vector3(0, 0, 0),
      scene
    );

    cameraRef.current = camera;
    camera.detachControl();

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    floorRef.current = createFloor(scene, backgroundColor);
    player1Ref.current.mesh = createPaddle(scene, primaryColor);
    player2Ref.current.mesh = createPaddle(scene, primaryColor);
    ballRef.current.mesh = createBall(scene, primaryColor);

    player1Ref.current.mesh.position.x = -20;
    player2Ref.current.mesh.position.x = 20;

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
      !ballRef.current.mesh ||
      !floorRef.current
    )
      return;

    const { primaryColor, secondaryColor, backgroundColor } = getThemeColorsFromDOM(theme);

    sceneRef.current.clearColor = new Color4(
      backgroundColor.r,
      backgroundColor.g,
      backgroundColor.b,
      1
    );

    if (floorRef.current.material) {
      const floorMaterial = floorRef.current.material as PBRMaterial;
      floorMaterial.albedoColor = backgroundColor;
    }

    if (player1Ref.current.mesh.material) {
      const material = player1Ref.current.mesh.material as PBRMaterial;
      material.albedoColor = primaryColor;
      material.emissiveColor = new Color3(
        primaryColor.r * 0.5,
        primaryColor.g * 0.5,
        primaryColor.b * 0.5
      );
    }

    if (player2Ref.current.mesh.material) {
      const material = player2Ref.current.mesh.material as PBRMaterial;
      material.albedoColor = primaryColor;
      material.emissiveColor = new Color3(
        primaryColor.r * 0.5,
        primaryColor.g * 0.5,
        primaryColor.b * 0.5
      );
    }

    if (ballRef.current.mesh.material) {
      const material = ballRef.current.mesh.material as PBRMaterial;
      material.albedoColor = primaryColor;
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
      tabIndex={0}
    />
  );
};

export default GameCanvas;
