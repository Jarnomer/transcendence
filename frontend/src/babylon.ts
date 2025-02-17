import * as BABYLON from "https://cdn.babylonjs.com/babylon.js";

window.addEventListener("DOMContentLoaded", () => {
    // Get the canvas element
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }

    // Create Babylon.js engine
    const engine: BABYLON.Engine = new BABYLON.Engine(canvas, true);

    // Create a basic scene function
    const createScene = (): BABYLON.Scene => {
        const scene = new BABYLON.Scene(engine);

        // Add a camera
        const camera: BABYLON.ArcRotateCamera = new BABYLON.ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 3,
            5,
            BABYLON.Vector3.Zero(),
            scene
        );
        camera.attachControl(canvas, true);

        // Add a light
        const light: BABYLON.HemisphericLight = new BABYLON.HemisphericLight(
            "light",
            new BABYLON.Vector3(1, 1, 0),
            scene
        );

        // Add a sphere
        const sphere: BABYLON.Mesh = BABYLON.MeshBuilder.CreateSphere(
            "sphere",
            { diameter: 1 },
            scene
        );
        sphere.position.y = 1;

        return scene;
    };

    // Initialize the scene
    const scene: BABYLON.Scene = createScene();

    // Run the render loop
    engine.runRenderLoop(() => {
        scene.render();
    });

    // Handle window resizing
    window.addEventListener("resize", () => {
        engine.resize();
    });
});