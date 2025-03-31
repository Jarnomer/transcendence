import React, { useEffect, useRef, useState } from 'react';

import {
  Animation,
  ArcRotateCamera,
  Color3,
  DefaultRenderingPipeline,
  Engine,
  Scene,
  Vector3,
} from 'babylonjs';

import {
  RetroEffectsManager,
  applyBallEffects,
  applyCollisionEffects,
  applyScoreEffects,
  ballSparkEffect,
  createBall,
  createFloor,
  createPaddle,
  createPongRetroEffects,
  getThemeColors,
  setupEnvironmentMap,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import { GameState } from '@shared/types';

interface BackgroundGameCanvasProps {
  gameState: GameState;
  theme?: 'light' | 'dark';
  isVisible: boolean;
}

// Define camera preset positions for cinematic effect
const CAMERA_PRESETS = [
  {
    alpha: -Math.PI / 2,
    beta: Math.PI / 2,
    radius: 24.5,
    target: new Vector3(-0.2, 0.1, 0),
    dof: { focalLength: 50, fStop: 2.8, focusDistance: 24.5 },
  },
  {
    alpha: -Math.PI / 3,
    beta: Math.PI / 3,
    radius: 30,
    target: new Vector3(0, 0, 0),
    dof: { focalLength: 85, fStop: 1.4, focusDistance: 30 },
  },
  {
    alpha: -Math.PI,
    beta: Math.PI / 4,
    radius: 20,
    target: new Vector3(-15, 0, 0),
    dof: { focalLength: 35, fStop: 2.0, focusDistance: 20 },
  },
  {
    alpha: 0,
    beta: Math.PI / 4,
    radius: 20,
    target: new Vector3(15, 0, 0),
    dof: { focalLength: 35, fStop: 2.0, focusDistance: 20 },
  },
  {
    alpha: -Math.PI / 2,
    beta: Math.PI / 6,
    radius: 35,
    target: new Vector3(0, 0, 0),
    dof: { focalLength: 105, fStop: 1.4, focusDistance: 35 },
  },
];

// Fixed values for positions
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 400;
const SCALE_FACTOR = 20;
const FIX_POSITION = 2;

// Helper function to get CSS variables
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

const detectCollision = (
  prevDx: number,
  prevDy: number,
  newDx: number,
  newDy: number
): 'dx' | 'dy' | null => {
  const dxCollision = prevDx !== 0 && newDx !== 0 && Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = prevDy !== 0 && newDy !== 0 && Math.sign(prevDy) !== Math.sign(newDy);

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

const BackgroundGameCanvas: React.FC<BackgroundGameCanvasProps> = ({
  gameState,
  theme = 'dark',
  isVisible,
}) => {
  const [lastTheme, setLastTheme] = useState(theme);
  const [currentPresetIndex, setCurrentPresetIndex] = useState(0);

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

  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const cameraSwitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  const floorRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  // Function to change camera position with animation
  const switchCameraPosition = () => {
    if (
      !cameraRef.current ||
      !postProcessingRef.current ||
      !sceneRef.current ||
      isTransitioningRef.current
    ) {
      return;
    }

    isTransitioningRef.current = true;

    // Trigger score effect when changing camera
    if (retroEffectsRef.current) {
      applyScoreEffects(retroEffectsRef.current);
    }

    const nextIndex = (currentPresetIndex + 1) % CAMERA_PRESETS.length;
    const currentPreset = CAMERA_PRESETS[currentPresetIndex];
    const nextPreset = CAMERA_PRESETS[nextIndex];

    // Animation settings
    const fps = 60;
    const transitionDuration = 3; // seconds

    // Create animations for camera position
    const alphaAnimation = new Animation(
      'alphaAnimation',
      'alpha',
      fps,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const betaAnimation = new Animation(
      'betaAnimation',
      'beta',
      fps,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const radiusAnimation = new Animation(
      'radiusAnimation',
      'radius',
      fps,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const targetAnimation = new Animation(
      'targetAnimation',
      'target',
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Create keyframes
    const keyframes = {
      alpha: [
        { frame: 0, value: currentPreset.alpha },
        { frame: fps * transitionDuration, value: nextPreset.alpha },
      ],
      beta: [
        { frame: 0, value: currentPreset.beta },
        { frame: fps * transitionDuration, value: nextPreset.beta },
      ],
      radius: [
        { frame: 0, value: currentPreset.radius },
        { frame: fps * transitionDuration, value: nextPreset.radius },
      ],
      target: [
        { frame: 0, value: currentPreset.target },
        { frame: fps * transitionDuration, value: nextPreset.target },
      ],
    };

    // Set keyframes
    alphaAnimation.setKeys(keyframes.alpha);
    betaAnimation.setKeys(keyframes.beta);
    radiusAnimation.setKeys(keyframes.radius);
    targetAnimation.setKeys(keyframes.target);

    // Animate camera
    sceneRef.current.beginDirectAnimation(
      cameraRef.current,
      [alphaAnimation, betaAnimation, radiusAnimation],
      0,
      fps * transitionDuration,
      false,
      1,
      () => {
        // Animation complete callback
        setCurrentPresetIndex(nextIndex);
        isTransitioningRef.current = false;

        // Apply the new depth of field settings
        if (postProcessingRef.current) {
          postProcessingRef.current.depthOfFieldEnabled = true;
          postProcessingRef.current.depthOfField.focalLength = nextPreset.dof.focalLength;
          postProcessingRef.current.depthOfField.fStop = nextPreset.dof.fStop;
          postProcessingRef.current.depthOfField.focusDistance = nextPreset.dof.focusDistance;
        }
      }
    );

    // Animate target separately (since it's a Vector3)
    sceneRef.current.beginDirectAnimation(
      cameraRef.current,
      [targetAnimation],
      0,
      fps * transitionDuration,
      false
    );

    // Transition depth of field during camera movement
    const currentDof = currentPreset.dof;
    const nextDof = nextPreset.dof;

    if (postProcessingRef.current) {
      // Enable depth of field for cinematic effect
      postProcessingRef.current.depthOfFieldEnabled = true;

      // Start with current settings
      postProcessingRef.current.depthOfField.focalLength = currentDof.focalLength;
      postProcessingRef.current.depthOfField.fStop = currentDof.fStop;
      postProcessingRef.current.depthOfField.focusDistance = currentDof.focusDistance;

      // Transition DOF settings
      const dofTransition = (progress: number) => {
        if (!postProcessingRef.current) return;

        const focalLength =
          currentDof.focalLength + progress * (nextDof.focalLength - currentDof.focalLength);
        const fStop = currentDof.fStop + progress * (nextDof.fStop - currentDof.fStop);
        const focusDistance =
          currentDof.focusDistance + progress * (nextDof.focusDistance - currentDof.focusDistance);

        postProcessingRef.current.depthOfField.focalLength = focalLength;
        postProcessingRef.current.depthOfField.fStop = fStop;
        postProcessingRef.current.depthOfField.focusDistance = focusDistance;
      };

      // Create animation loop for DOF transition
      const startTime = Date.now();
      const endTime = startTime + transitionDuration * 1000;

      const updateDof = () => {
        const now = Date.now();
        if (now >= endTime) {
          return;
        }

        const progress = (now - startTime) / (endTime - startTime);
        dofTransition(progress);
        requestAnimationFrame(updateDof);
      };

      updateDof();
    }
  };

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState || !isVisible) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, { stencil: true });
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    setupEnvironmentMap(scene);

    const camera = setupSceneCamera(scene);

    const initialPreset = CAMERA_PRESETS[0];
    camera.alpha = initialPreset.alpha;
    camera.beta = initialPreset.beta;
    camera.radius = initialPreset.radius;
    camera.setTarget(initialPreset.target);

    const pipeline = setupPostProcessing(scene, camera);

    // Configure depth of field for cinematic effect
    pipeline.depthOfFieldEnabled = true;
    pipeline.depthOfField.focalLength = initialPreset.dof.focalLength;
    pipeline.depthOfField.fStop = initialPreset.dof.fStop;
    pipeline.depthOfField.focusDistance = initialPreset.dof.focusDistance;

    const { shadowGenerators } = setupScenelights(scene);

    floorRef.current = createFloor(scene, backgroundColor);
    player1Ref.current = createPaddle(scene, primaryColor);
    player2Ref.current = createPaddle(scene, primaryColor);
    ballRef.current = createBall(scene, primaryColor);

    const gameObjects = [player1Ref.current, player2Ref.current, ballRef.current];
    setupReflections(scene, floorRef.current, gameObjects);
    shadowGenerators.forEach((generator) => {
      gameObjects.forEach((obj) => {
        generator.addShadowCaster(obj);
      });
    });

    engineRef.current = engine;
    sceneRef.current = scene;
    themeColors.current = colors;
    postProcessingRef.current = pipeline;
    cameraRef.current = camera;

    // Set paddle positions
    player1Ref.current.position.x = -20;
    player2Ref.current.position.x = 19.5;

    setLastTheme(theme);

    const sparkCleanUp = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);
    sparkEffectsRef.current = sparkCleanUp;

    const retroEffects = createPongRetroEffects(scene, camera, 'cinematic');
    retroEffectsRef.current = retroEffects;

    setTimeout(() => {
      if (retroEffectsRef.current) {
        retroEffectsRef.current.simulateCRTTurnOn(1800).then(() => {});
      }
    }, 100);

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    // Set up camera switching interval
    cameraSwitchTimerRef.current = setInterval(switchCameraPosition, 15000);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sparkEffectsRef.current) sparkEffectsRef.current(0, 0);
      if (retroEffectsRef.current) retroEffectsRef.current.dispose();
      if (cameraSwitchTimerRef.current) clearInterval(cameraSwitchTimerRef.current);
      engine.dispose();
      scene.dispose();
    };
  }, [isVisible]);

  // Update game objects
  useEffect(() => {
    if (!canvasRef.current || !themeColors.current || !isVisible) return;

    const { players, ball } = gameState;
    const color = themeColors.current.primaryColor;

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

    // Calculate current speed and angle, detect collision and score
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);
    const collision = detectCollision(
      prevBallState.current.dx,
      prevBallState.current.dy,
      ball.dx,
      ball.dy
    );
    const score = detectScore(
      players.player1.score,
      players.player2.score,
      lastScoreRef.current,
      ball.dx
    );

    applyBallEffects(ballRef.current, speed, angle, ball.spin, color);

    if (sparkEffectsRef.current) sparkEffectsRef.current(speed, ball.spin);

    if (collision) {
      applyCollisionEffects(
        retroEffectsRef.current,
        ballRef.current,
        player1Ref.current,
        player2Ref.current,
        collision,
        speed,
        color
      );
    }

    if (score) {
      applyScoreEffects(retroEffectsRef.current);
    }

    prevBallState.current = {
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
      spin: ball.spin,
    };
  }, [gameState, isVisible]);

  // Handle visibility changes
  useEffect(() => {
    if (!engineRef.current) return;

    if (!isVisible) {
      if (cameraSwitchTimerRef.current) {
        clearInterval(cameraSwitchTimerRef.current);
        cameraSwitchTimerRef.current = null;
      }

      if (retroEffectsRef.current) {
        retroEffectsRef.current.simulateCRTTurnOff(1500);
      }

      engineRef.current.stopRenderLoop();
    } else {
      if (engineRef.current && sceneRef.current) {
        engineRef.current.runRenderLoop(() => {
          if (sceneRef.current) {
            sceneRef.current.render();
          }
        });
      }

      if (retroEffectsRef.current) {
        retroEffectsRef.current.simulateCRTTurnOn(1800);
      }

      // Restart camera switching
      if (!cameraSwitchTimerRef.current) {
        cameraSwitchTimerRef.current = setInterval(switchCameraPosition, 15000);
      }
    }
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        opacity: isVisible ? 0.7 : 0,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: 'none',
      }}
    />
  );
};

export default BackgroundGameCanvas;
