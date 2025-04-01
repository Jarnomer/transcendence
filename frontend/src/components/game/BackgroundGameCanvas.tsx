import React, { useEffect, useRef } from 'react';

import {
  ArcRotateCamera,
  Color3,
  DefaultRenderingPipeline,
  Engine,
  Scene,
  Vector3,
  Animation,
  EasingFunction,
  CubicEase,
} from 'babylonjs';

import {
  RetroEffectsManager,
  applyBallEffects,
  applyCollisionEffects,
  applyScoreEffects,
  ballSparkEffect,
  createBall,
  createEdge,
  createFloor,
  createPaddle,
  createPongRetroEffects,
  getThemeColors,
  // setupEnvironmentMap,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import {
  GameState,
  RetroEffectsLevels,
  defaultRetroEffectsLevels,
  defaultGameParams,
  retroEffectsPresets,
} from '@shared/types';

interface BackgroundGameCanvasProps {
  gameState: GameState;
  isVisible: boolean;
  theme?: 'light' | 'dark';
  retroPreset?: 'default' | 'cinematic';
  retroLevels?: RetroEffectsLevels;
}

// Camera angle presets
// interface CameraAngle {
//   alpha: number; // horizontal rotation in radians
//   beta: number; // vertical rotation in radians
//   radius: number; // distance from target
//   target?: Vector3; // optional target position
// }

// Camera position interface with extended options
interface CameraAngle {
  // Traditional spherical coordinates for ArcRotateCamera
  alpha: number; // horizontal rotation in radians
  beta: number; // vertical rotation in radians
  radius: number; // distance from target
  target?: Vector3; // optional target position

  // Direct positioning (if you want to set XYZ directly)
  position?: Vector3; // explicit XYZ position

  // Depth of field settings
  dofEnabled?: boolean; // enable/disable depth of field
  focalLength?: number; // camera focal length
  fStop?: number; // aperture f-stop
  focusDistance?: number; // focus distance
  dofBlurLevel?: number; // blur level (low, medium, high)
}

// Define different camera angles to cycle through
const cameraAngles: CameraAngle[] = [
  {
    alpha: Math.PI / 3, // ignored if position is set
    beta: Math.PI / 3,
    radius: 20,
    position: new Vector3(35, 20, 10), // explicit position
    target: new Vector3(20, 10, 5), // where camera points
    dofEnabled: true,
    focalLength: 50,
    fStop: 1.5,
    focusDistance: 50,
    dofBlurLevel: 5,
  },
];

const getThemeColorsFromDOM = (theme: 'light' | 'dark' = 'dark') => {
  const computedStyle = getComputedStyle(document.documentElement);

  document.documentElement.setAttribute('data-theme', theme);

  const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
  const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim();
  const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();

  return getThemeColors(theme, primaryColor, secondaryColor, backgroundColor);
};

const detectCollision = (
  gameHeight: number,
  prevDx: number,
  newDx: number,
  newY: number,
  prevY: number
): 'dx' | 'dy' | null => {
  const bottomBoundary = gameHeight - 10;
  const topBoundary = 0;

  const hitTop = newY <= topBoundary && prevY > topBoundary;
  const hitBottom = newY >= bottomBoundary && prevY < bottomBoundary;

  const dxCollision = Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = hitTop || hitBottom;

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

// Function to animate camera to a new position
const animateCamera = (
  camera: ArcRotateCamera,
  targetAngle: CameraAngle,
  pipeline: DefaultRenderingPipeline | null,
  duration: number = 3000
) => {
  const scene = camera.getScene();
  const animations = [];

  // 1. Handle camera position animations
  if (targetAngle.position) {
    // Direct position animation (XYZ coordinates)
    const positionAnimation = new Animation(
      'cameraPositionAnimation',
      'position',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    positionAnimation.setKeys([
      { frame: 0, value: camera.position.clone() },
      { frame: 100, value: targetAngle.position },
    ]);

    animations.push({
      animation: positionAnimation,
      target: camera,
    });
  } else {
    // Traditional spherical coordinates animation
    // Create animations for alpha, beta and radius
    const alphaAnimation = new Animation(
      'cameraAlphaAnimation',
      'alpha',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const betaAnimation = new Animation(
      'cameraBetaAnimation',
      'beta',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    const radiusAnimation = new Animation(
      'cameraRadiusAnimation',
      'radius',
      30,
      Animation.ANIMATIONTYPE_FLOAT,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    // Create keyframes
    const keyframes = {
      alpha: [
        { frame: 0, value: camera.alpha },
        { frame: 100, value: targetAngle.alpha },
      ],
      beta: [
        { frame: 0, value: camera.beta },
        { frame: 100, value: targetAngle.beta },
      ],
      radius: [
        { frame: 0, value: camera.radius },
        { frame: 100, value: targetAngle.radius },
      ],
    };

    // Set keyframes
    alphaAnimation.setKeys(keyframes.alpha);
    betaAnimation.setKeys(keyframes.beta);
    radiusAnimation.setKeys(keyframes.radius);

    // Add animations to list
    animations.push({
      animation: alphaAnimation,
      target: camera,
    });

    animations.push({
      animation: betaAnimation,
      target: camera,
    });

    animations.push({
      animation: radiusAnimation,
      target: camera,
    });
  }

  // 2. Add target animation if specified
  if (targetAngle.target) {
    const targetAnimation = new Animation(
      'cameraTargetAnimation',
      'target',
      30,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT
    );

    targetAnimation.setKeys([
      { frame: 0, value: camera.target.clone() },
      { frame: 100, value: targetAngle.target },
    ]);

    animations.push({
      animation: targetAnimation,
      target: camera,
    });
  }

  // 3. Add depth of field animations if specified
  if (pipeline && targetAngle.dofEnabled !== undefined) {
    // Enable/disable DOF
    pipeline.depthOfFieldEnabled = targetAngle.dofEnabled;

    if (targetAngle.dofEnabled) {
      // Set DOF parameters
      if (targetAngle.focalLength !== undefined) {
        const focalLengthAnimation = new Animation(
          'dofFocalLengthAnimation',
          'depthOfField.focalLength',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        focalLengthAnimation.setKeys([
          { frame: 0, value: pipeline.depthOfField.focalLength },
          { frame: 100, value: targetAngle.focalLength },
        ]);

        animations.push({
          animation: focalLengthAnimation,
          target: pipeline,
        });
      }

      if (targetAngle.fStop !== undefined) {
        const fStopAnimation = new Animation(
          'dofFStopAnimation',
          'depthOfField.fStop',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        fStopAnimation.setKeys([
          { frame: 0, value: pipeline.depthOfField.fStop },
          { frame: 100, value: targetAngle.fStop },
        ]);

        animations.push({
          animation: fStopAnimation,
          target: pipeline,
        });
      }

      if (targetAngle.focusDistance !== undefined) {
        const focusDistanceAnimation = new Animation(
          'dofFocusDistanceAnimation',
          'depthOfField.focusDistance',
          30,
          Animation.ANIMATIONTYPE_FLOAT,
          Animation.ANIMATIONLOOPMODE_CONSTANT
        );

        focusDistanceAnimation.setKeys([
          { frame: 0, value: pipeline.depthOfField.focusDistance },
          { frame: 100, value: targetAngle.focusDistance },
        ]);

        animations.push({
          animation: focusDistanceAnimation,
          target: pipeline,
        });
      }

      if (targetAngle.dofBlurLevel !== undefined) {
        pipeline.depthOfFieldBlurLevel = targetAngle.dofBlurLevel;
      }
    }
  }

  // Add easing function for smooth transitions to all animations
  const easingFunction = new CubicEase();
  easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

  animations.forEach((anim) => {
    anim.animation.setEasingFunction(easingFunction);
  });

  // Start animations
  const animatables = animations.map((anim) => {
    return scene.beginDirectAnimation(
      anim.target,
      [anim.animation],
      0,
      100,
      false,
      (1000 / duration) * 100
    );
  });

  return animatables;
};

// Get a random camera angle from the presets
const getRandomCameraAngle = (): CameraAngle => {
  const randomIndex = Math.floor(Math.random() * cameraAngles.length);
  return cameraAngles[randomIndex];
};

const BackgroundGameCanvas: React.FC<BackgroundGameCanvasProps> = ({
  gameState,
  isVisible,
  theme = 'dark',
  retroPreset = 'cinematic',
  retroLevels = retroEffectsPresets.cinematic,
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

  const postProcessingRef = useRef<DefaultRenderingPipeline | null>(null);
  const sparkEffectsRef = useRef<((speed: number, spin: number) => void) | null>(null);
  const retroEffectsRef = useRef<RetroEffectsManager | null>(null);
  const retroLevelsRef = useRef<RetroEffectsLevels>(defaultRetroEffectsLevels);
  const lastScoreRef = useRef<{ value: number }>({ value: 0 });
  const currentAngleIndexRef = useRef<number>(-1);
  const cameraMoveTimerRef = useRef<number | null>(null);

  const floorRef = useRef<any>(null);
  const topEdgeRef = useRef<any>(null);
  const bottomEdgeRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  const width = defaultGameParams.gameWidth;
  const height = defaultGameParams.gameHeight;
  const scaleFactor = 20;

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    // setupEnvironmentMap(scene);

    const camera = setupSceneCamera(scene);
    const pipeline = setupPostProcessing(scene, camera);
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

    // Set edge and paddle positions
    topEdgeRef.current.position.y = height / 2 / scaleFactor + 0.5;
    bottomEdgeRef.current.position.y = -height / 2 / scaleFactor - 0.5;
    player1Ref.current.position.x = -20;
    player2Ref.current.position.x = 19.5;

    sparkEffectsRef.current = ballSparkEffect(ballRef.current, primaryColor, scene, 0, 0);
    retroEffectsRef.current = createPongRetroEffects(scene, camera, retroPreset, retroLevels);
    retroLevelsRef.current = retroLevels;

    if (isVisible) {
      engine.runRenderLoop(() => {
        scene.render();
      });
    }

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (sparkEffectsRef.current) sparkEffectsRef.current(0, 0);
      if (retroEffectsRef.current) retroEffectsRef.current.dispose();
      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }
      engine.dispose();
      scene.dispose();
    };
  }, [isVisible]);

  // Handle visibility changes and initialize camera position
  useEffect(() => {
    if (!engineRef.current || !sceneRef.current || !cameraRef.current) return;

    // Clear any existing camera movement timer
    if (cameraMoveTimerRef.current) {
      window.clearInterval(cameraMoveTimerRef.current);
      cameraMoveTimerRef.current = null;
    }

    if (!isVisible) {
      engineRef.current.stopRenderLoop();
    } else {
      // When becoming visible, set a random initial camera angle
      const randomAngle = getRandomCameraAngle();
      const camera = cameraRef.current;

      // Set the camera position based on the angle configuration
      if (randomAngle.position) {
        // If explicit position is provided, use it
        camera.position = randomAngle.position.clone();
      } else {
        // Otherwise use the traditional spherical coordinates
        camera.alpha = randomAngle.alpha;
        camera.beta = randomAngle.beta;
        camera.radius = randomAngle.radius;
      }

      // Set target if provided
      if (randomAngle.target) {
        camera.target = randomAngle.target.clone();
      }

      // Set depth of field settings if provided and if post-processing is available
      if (postProcessingRef.current && randomAngle.dofEnabled !== undefined) {
        const pipeline = postProcessingRef.current;
        pipeline.depthOfFieldEnabled = randomAngle.dofEnabled;

        if (randomAngle.dofEnabled) {
          if (randomAngle.focalLength !== undefined) {
            pipeline.depthOfField.focalLength = randomAngle.focalLength;
          }

          if (randomAngle.fStop !== undefined) {
            pipeline.depthOfField.fStop = randomAngle.fStop;
          }

          if (randomAngle.focusDistance !== undefined) {
            pipeline.depthOfField.focusDistance = randomAngle.focusDistance;
          }

          if (randomAngle.dofBlurLevel !== undefined) {
            pipeline.depthOfFieldBlurLevel = randomAngle.dofBlurLevel;
          }
        }
      }

      // Find the index of the randomly chosen angle for tracking
      currentAngleIndexRef.current = cameraAngles.findIndex((angle) => angle === randomAngle);

      // Start the camera movement timer
      cameraMoveTimerRef.current = window.setInterval(() => {
        if (cameraRef.current) {
          // Move to the next camera angle
          currentAngleIndexRef.current = (currentAngleIndexRef.current + 1) % cameraAngles.length;
          const newAngle = cameraAngles[currentAngleIndexRef.current];

          // Animate to the new position with DOF settings
          animateCamera(cameraRef.current, newAngle, postProcessingRef.current);
        }
      }, 10000); // Change camera every 10 seconds

      // Start the render loop
      engineRef.current.runRenderLoop(() => {
        if (sceneRef.current) {
          sceneRef.current.render();
        }
      });
    }

    return () => {
      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }
    };
  }, [isVisible]);

  // Update effect levels
  useEffect(() => {
    if (!retroEffectsRef.current) return;

    try {
      if (retroLevels !== retroLevelsRef.current) {
        retroEffectsRef.current.updateLevels(retroLevels);
        retroLevelsRef.current = retroLevels;
      }

      if (retroPreset === 'cinematic' || retroPreset === 'default') {
        retroEffectsRef.current.applyPreset(retroPreset);
      }
    } catch (error) {
      console.error('Error updating retro effects:', error);
    }
  }, [retroLevels, retroPreset]);

  // Update game objects based on game state
  useEffect(() => {
    if (!themeColors.current) {
      console.log('No color theme');
      return;
    } else if (!isVisible) {
      console.log('Canvas not visible');
      return;
    }

    const { players, ball } = gameState;
    const color = themeColors.current.primaryColor;

    // Convert coordinates to Babylon coordinate system
    const player1Y = -((players.player1.y - height / 2) / scaleFactor) - 2;
    const player2Y = -((players.player2.y - height / 2) / scaleFactor) - 2;
    const ballY = -((ball.y - height / 2) / scaleFactor);
    const ballX = (ball.x - width / 2) / scaleFactor;

    // Update mesh positions directly
    player1Ref.current.position.y = player1Y;
    player2Ref.current.position.y = player2Y;
    ballRef.current.position.x = ballX;
    ballRef.current.position.y = ballY;

    // Calculate current speed and angle, detect collision and score
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);
    const collision = detectCollision(
      defaultGameParams.gameHeight,
      prevBallState.current.dx,
      ball.dx,
      prevBallState.current.y,
      ball.y
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

  return (
    <canvas
      ref={canvasRef}
      style={{
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        // opacity: isVisible ? 0.3 : 0,
        // transition: 'opacity 0.5s ease',
      }}
    />
  );
};

export default BackgroundGameCanvas;
