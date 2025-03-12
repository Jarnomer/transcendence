import React, { useEffect, useRef, useState } from 'react';

import {
  ArcRotateCamera,
  Color3,
  Color4,
  CubeTexture,
  Engine,
  GlowLayer,
  HemisphericLight,
  PBRMaterial,
  Scene,
  ShadowGenerator,
  SpotLight,
  Vector3,
} from 'babylonjs';

import { GameState } from '@shared/types';
import {
  createBall,
  createFloor,
  createPaddle,
  getThemeColors,
  updateBallTrail,
  updateBallTrailColor,
} from '@shared/utils';

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
  const [lastTheme, setLastTheme] = useState(theme);

  // Store previous ball position to calculate velocity
  const prevBallPos = useRef({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const cameraRef = useRef<ArcRotateCamera | null>(null);

  // Updated refs to only store mesh objects, not positions
  const floorRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

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
      24.5, // distance from target
      new Vector3(0, 0, 0),
      scene
    );

    cameraRef.current = camera;
    camera.detachControl();

    const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.5;

    const spotLight1 = new SpotLight(
      'spotLight1',
      new Vector3(-10, 10, 10),
      new Vector3(0, -1, -0.5),
      Math.PI / 3,
      10,
      scene
    );
    spotLight1.intensity = 0.7;

    const spotLight2 = new SpotLight(
      'spotLight2',
      new Vector3(10, 10, 10),
      new Vector3(0, -1, -0.5),
      Math.PI / 3,
      10,
      scene
    );
    spotLight2.intensity = 0.7;

    // Create game objects
    floorRef.current = createFloor(scene, backgroundColor);
    player1Ref.current = createPaddle(scene, primaryColor);
    player2Ref.current = createPaddle(scene, primaryColor);
    ballRef.current = createBall(scene, primaryColor);

    // Set paddle positions
    player1Ref.current.position.x = -20;
    player2Ref.current.position.x = 20;

    // Initialize previous ball position
    prevBallPos.current = {
      x: gameState.ball.x,
      y: gameState.ball.y,
    };

    // Shadow generation
    const shadowGenerator = new ShadowGenerator(1024, spotLight1);
    shadowGenerator.addShadowCaster(player1Ref.current);
    shadowGenerator.addShadowCaster(player2Ref.current);
    shadowGenerator.addShadowCaster(ballRef.current);
    shadowGenerator.useBlurExponentialShadowMap = true;

    const glowLayer = new GlowLayer('glowLayer', scene);
    glowLayer.intensity = 1.2;
    glowLayer.blurKernelSize = 32;

    // Add game objects to glow layer
    glowLayer.addIncludedOnlyMesh(player1Ref.current);
    glowLayer.addIncludedOnlyMesh(player2Ref.current);
    glowLayer.addIncludedOnlyMesh(ballRef.current);

    // Save current theme
    setLastTheme(theme);

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
  }, []);

  // Apply theme change without recreating the scene
  useEffect(() => {
    if (
      !sceneRef.current ||
      !player1Ref.current ||
      !player2Ref.current ||
      !ballRef.current ||
      !floorRef.current
    )
      return;

    // Only update if theme actually changed
    if (theme === lastTheme) return;

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

    if (player1Ref.current.material) {
      const material = player1Ref.current.material as PBRMaterial;
      material.albedoColor = primaryColor;
      material.emissiveColor = new Color3(
        primaryColor.r * 0.5,
        primaryColor.g * 0.5,
        primaryColor.b * 0.5
      );
    }

    if (player2Ref.current.material) {
      const material = player2Ref.current.material as PBRMaterial;
      material.albedoColor = primaryColor;
      material.emissiveColor = new Color3(
        primaryColor.r * 0.5,
        primaryColor.g * 0.5,
        primaryColor.b * 0.5
      );
    }

    if (ballRef.current.material) {
      const material = ballRef.current.material as PBRMaterial;
      material.albedoColor = primaryColor;
      material.emissiveColor = new Color3(
        primaryColor.r * 0.7,
        primaryColor.g * 0.7,
        primaryColor.b * 0.7
      );

      // Update the trail color when theme changes
      updateBallTrailColor(ballRef.current, primaryColor, sceneRef.current);
    }

    setLastTheme(theme);
  }, [theme, lastTheme]);

  useEffect(() => {
    if (
      !canvasRef.current ||
      !gameState ||
      !player1Ref.current ||
      !player2Ref.current ||
      !ballRef.current ||
      !sceneRef.current
    )
      return;

    const { players, ball } = gameState;

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

    // Update the ball trail effect using the ball dx/dy
    // Note: Inverted dy for Babylon coordinate system
    updateBallTrail(ballRef.current, ball.dx, -ball.dy);

    prevBallPos.current = { x: ball.x, y: ball.y };
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
