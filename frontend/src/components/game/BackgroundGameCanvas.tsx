import React, { useEffect, useRef } from 'react';

import {
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  Engine,
  Scene,
  Vector3,
} from 'babylonjs';

import {
  RetroEffectsManager,
  animateCamera,
  applyBallEffects,
  applyCameraAngle,
  applyCollisionEffects,
  cameraAngles,
  createBall,
  createEdge,
  createFloor,
  createPaddle,
  createPongRetroEffects,
  enableRequiredExtensions,
  gameToSceneX,
  gameToSceneY,
  getRandomCameraAngle,
  getThemeColors,
  parseColor,
  setupPostProcessing,
  setupReflections,
  setupSceneCamera,
  setupScenelights,
} from '@game/utils';

import {
  GameState,
  RetroEffectsBaseParams,
  RetroEffectsLevels,
  defaultCameraTimings,
  defaultCinematicGlitchTimings,
  defaultGameObjectParams,
  defaultGameParams,
  defaultRetroCinematicBaseParams,
  defaultRetroEffectTimings,
  defaultRetroEffectsLevels,
  retroEffectsPresets,
} from '@shared/types';

interface BackgroundGameCanvasProps {
  gameState: GameState;
  isVisible: boolean;
  theme?: 'light' | 'dark';
  retroPreset?: 'default' | 'cinematic';
  retroLevels?: RetroEffectsLevels;
  retroBaseParams?: RetroEffectsBaseParams;
  randomGlitchEnabled?: boolean;
}

const applyLowQualitySettings = (scene: Scene, pipeline: DefaultRenderingPipeline | null) => {
  scene.getEngine().setHardwareScalingLevel(2.0);

  scene.shadowsEnabled = true;
  scene.lightsEnabled = true;
  scene.skipFrustumClipping = true;
  scene.skipPointerMovePicking = true;

  if (pipeline) {
    pipeline.bloomEnabled = false;
    pipeline.depthOfFieldEnabled = false;
    pipeline.chromaticAberrationEnabled = true;
    pipeline.grainEnabled = true;
    pipeline.fxaaEnabled = true;
    pipeline.samples = 1;
  }

  // Enable occlusion culling
  scene.autoClear = false;
  scene.autoClearDepthAndStencil = false;
  scene.blockMaterialDirtyMechanism = true;
};

const setupThrottledRenderLoop = (engine: Engine, scene: Scene) => {
  const interval = 1000 / 30; // 30 fps

  let lastTime = 0;

  engine.runRenderLoop(() => {
    const currentTime = performance.now();
    if (currentTime - lastTime >= interval) {
      lastTime = currentTime;
      scene.render();
    }
  });
};

const optimizeShadowGenerators = (shadowGenerators: any[]) => {
  shadowGenerators.forEach((generator) => {
    generator.useBlurExponentialShadowMap = true;
    generator.blurKernel = 8;
    generator.bias = 0.01;
    generator.mapSize = 512;
    generator.forceBackFacesOnly = true;
    generator.usePercentageCloserFiltering = false;
  });
};

const getThemeColorsFromDOM = (theme: 'light' | 'dark' = 'dark') => {
  const computedStyle = getComputedStyle(document.documentElement);

  document.documentElement.setAttribute('data-theme', theme);

  const primaryColor = computedStyle.getPropertyValue('--color-primary').trim();
  const secondaryColor = computedStyle.getPropertyValue('--color-secondary').trim();
  const backgroundColor = computedStyle.getPropertyValue('--color-background').trim();

  return getThemeColors(theme, primaryColor, secondaryColor, backgroundColor);
};

const detectCollision = (prevDx: number, newDx: number, newY: number): 'dx' | 'dy' | null => {
  const gameHeight = defaultGameParams.dimensions.gameHeight;
  const ballSize = defaultGameParams.ball.size;
  const dxCollision = Math.sign(prevDx) !== Math.sign(newDx);
  const dyCollision = newY === 0 || newY === gameHeight - ballSize;

  if (dxCollision) return 'dx';
  if (dyCollision) return 'dy';

  return null;
};

const BackgroundGameCanvas: React.FC<BackgroundGameCanvasProps> = ({
  gameState,
  isVisible,
  theme = 'dark',
  retroPreset = 'cinematic',
  retroLevels = retroEffectsPresets.cinematic,
  retroBaseParams = defaultRetroCinematicBaseParams,
  randomGlitchEnabled = true,
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
  const retroEffectsRef = useRef<RetroEffectsManager | null>(null);
  const retroLevelsRef = useRef<RetroEffectsLevels>(defaultRetroEffectsLevels);
  const currentAngleIndexRef = useRef<number>(-1);
  const cameraMoveTimerRef = useRef<number | null>(null);
  const randomGlitchTimerRef = useRef<number | null>(null);

  const floorRef = useRef<any>(null);
  const topEdgeRef = useRef<any>(null);
  const bottomEdgeRef = useRef<any>(null);
  const player1Ref = useRef<any>(null);
  const player2Ref = useRef<any>(null);
  const ballRef = useRef<any>(null);

  const gameWidth = defaultGameParams.dimensions.gameWidth;
  const gameHeight = defaultGameParams.dimensions.gameHeight;

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !gameState) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    enableRequiredExtensions(engine);
    const scene = new Scene(engine);

    const colors = getThemeColorsFromDOM(theme);
    const { primaryColor, backgroundColor } = colors;

    const bgColor = parseColor('#33353e');
    scene.clearColor = new Color4(bgColor.r, bgColor.g, bgColor.b, 1.0);

    const camera = setupSceneCamera(scene);

    const pipeline = setupPostProcessing(scene, camera, true);
    applyLowQualitySettings(scene, pipeline);

    const { shadowGenerators } = setupScenelights(scene);
    optimizeShadowGenerators(shadowGenerators);

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

    topEdgeRef.current.position.x = gameToSceneX(0, topEdgeRef.current);
    topEdgeRef.current.position.y = gameToSceneY(0, topEdgeRef.current);
    bottomEdgeRef.current.position.x = gameToSceneX(0, bottomEdgeRef.current);
    bottomEdgeRef.current.position.y = gameToSceneY(gameHeight, bottomEdgeRef.current);

    retroEffectsRef.current = createPongRetroEffects(
      scene,
      camera,
      retroPreset,
      retroLevels,
      retroBaseParams
    );
    retroLevelsRef.current = retroLevels;

    if (isVisible) {
      setupThrottledRenderLoop(engine, scene);
    }

    const handleResize = () => {
      engine.resize();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (engineRef.current) engineRef.current.renderEvenInBackground = false;
      } else {
        if (engineRef.current) engineRef.current.renderEvenInBackground = true;
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (retroEffectsRef.current) retroEffectsRef.current.dispose();
      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }
      engine.dispose();
      scene.dispose();
    };
  }, [isVisible]);

  // Handle visibility and camera positions
  useEffect(() => {
    if (!engineRef.current || !sceneRef.current || !cameraRef.current) return;

    // Clear any existing camera movement timer
    if (cameraMoveTimerRef.current) {
      window.clearInterval(cameraMoveTimerRef.current);
      cameraMoveTimerRef.current = null;
    }

    if (!isVisible) {
      if (retroEffectsRef.current) {
        retroEffectsRef.current
          .simulateCRTTurnOff(defaultRetroEffectTimings.crtTurnOffDuration)
          .then(() => {
            if (engineRef.current) engineRef.current.stopRenderLoop();
          });
      } else {
        if (engineRef.current) engineRef.current.stopRenderLoop();
      }
    } else {
      const randomAngle = getRandomCameraAngle();
      const camera = cameraRef.current;

      applyCameraAngle(camera, randomAngle, postProcessingRef.current);

      currentAngleIndexRef.current = cameraAngles.findIndex((angle) => angle === randomAngle);

      cameraMoveTimerRef.current = window.setInterval(() => {
        if (cameraRef.current) {
          currentAngleIndexRef.current = (currentAngleIndexRef.current + 1) % cameraAngles.length;
          const newAngle = cameraAngles[currentAngleIndexRef.current];

          animateCamera(cameraRef.current, newAngle, postProcessingRef.current);
        }
      }, defaultCameraTimings.cameraMoveInterval);

      if (engineRef.current && sceneRef.current) {
        setupThrottledRenderLoop(engineRef.current, sceneRef.current);
      }

      if (retroEffectsRef.current) {
        setTimeout(() => {
          if (retroEffectsRef.current) {
            retroEffectsRef.current.simulateCRTTurnOn(defaultRetroEffectTimings.crtTurnOnDuration);
          }
        }, defaultRetroEffectTimings.crtTurnOnDelay);
      }
    }

    return () => {
      if (cameraMoveTimerRef.current) {
        window.clearInterval(cameraMoveTimerRef.current);
        cameraMoveTimerRef.current = null;
      }
    };
  }, [isVisible]);

  // Random glitch effects
  useEffect(() => {
    if (!isVisible || !retroEffectsRef.current || !randomGlitchEnabled) return;

    if (randomGlitchTimerRef.current) {
      window.clearTimeout(randomGlitchTimerRef.current);
      randomGlitchTimerRef.current = null;
    }

    const scheduleNextGlitch = () => {
      const params = defaultCinematicGlitchTimings;
      const nextDelay =
        Math.floor(Math.random() * params.additiveEffectInterval) + params.baseEffectInterval;

      randomGlitchTimerRef.current = window.setTimeout(() => {
        if (!retroEffectsRef.current || !isVisible) return;

        const intensity = params.baseIntensity + Math.random() * params.randomIntensityMultiplier;
        const duration = params.baseDuration + Math.random() * params.randomDurationMultiplier;

        retroEffectsRef.current.setGlitchAmount(intensity, duration);

        scheduleNextGlitch();
      }, nextDelay);
    };

    scheduleNextGlitch();

    return () => {
      if (randomGlitchTimerRef.current) {
        window.clearTimeout(randomGlitchTimerRef.current);
        randomGlitchTimerRef.current = null;
      }
    };
  }, [isVisible, randomGlitchEnabled]);

  // Update game objects
  useEffect(() => {
    if (!themeColors.current || !isVisible) return;

    const { players, ball } = gameState;
    const color = themeColors.current.primaryColor;

    // Convert coordinates to Babylon coordinate system
    player1Ref.current.position.x = gameToSceneX(0, player1Ref.current);
    player1Ref.current.position.y = gameToSceneY(players.player1.y, player1Ref.current);
    player2Ref.current.position.x = gameToSceneX(gameWidth, player2Ref.current);
    player2Ref.current.position.y = gameToSceneY(players.player2.y, player2Ref.current);
    ballRef.current.position.x = gameToSceneX(ball.x, ballRef.current);
    ballRef.current.position.y = gameToSceneY(ball.y, ballRef.current);

    // Calculate current speed and angle, detect collision and score
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    const angle = Math.atan2(ball.dx, -ball.dy);
    const collision = detectCollision(prevBallState.current.dx, ball.dx, ball.y);

    applyBallEffects(ballRef.current, speed, angle, ball.spin, color);

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
        color,
        false
      );
    }

    prevBallState.current = {
      x: ball.x,
      y: ball.y,
      dx: ball.dx,
      dy: ball.dy,
      spin: ball.spin,
    };
  }, [gameState, isVisible]);

  return <canvas ref={canvasRef} className="w-full h-full pointer-events-none bg-[#33353e]" />;
};

export default BackgroundGameCanvas;
