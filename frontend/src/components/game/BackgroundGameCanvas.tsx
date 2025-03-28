import React, { useEffect, useRef } from 'react';

import {
  Engine,
  Scene,
  HemisphericLight,
  Vector3,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  ArcRotateCamera,
} from 'babylonjs';

interface SimpleTestCanvasProps {
  isVisible: boolean;
}

const BackgroundGameCanvas: React.FC<SimpleTestCanvasProps> = ({ isVisible }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);

  // Initial render setup
  useEffect(() => {
    if (!canvasRef.current || !isVisible) return;

    // Create engine
    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);

    // Create scene with blue background
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 1, 1);

    // Create camera
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 3,
      10,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvas, true);

    // Create hemisphere light
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Create red sphere
    const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2 }, scene);
    const material = new StandardMaterial('sphereMaterial', scene);
    material.diffuseColor = new Color3(1, 0, 0);
    sphere.material = material;

    // Store references
    engineRef.current = engine;
    sceneRef.current = scene;

    // Start render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
      scene.dispose();
    };
  }, [isVisible]);

  // Handle visibility changes
  useEffect(() => {
    if (!engineRef.current || !sceneRef.current) return;

    if (!isVisible) {
      engineRef.current.stopRenderLoop();
    } else {
      engineRef.current.runRenderLoop(() => {
        if (sceneRef.current) {
          sceneRef.current.render();
        }
      });
    }
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
      }}
    />
  );
};

export default BackgroundGameCanvas;
