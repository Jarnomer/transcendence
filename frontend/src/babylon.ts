import * as BABYLON from "babylonjs";

// Wait for all HTML elements to exist
window.addEventListener("DOMContentLoaded", () => {

    // Get the canvas from HTML elements
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    if (!canvas) {
        console.error("Canvas element not found");
        return;
    }

    // Create Babylon engine, 'true' enables antialiasing
    const engine: BABYLON.Engine = new BABYLON.Engine(canvas, true);

    // Create a basic scene function
    const createScene = (): BABYLON.Scene => {
        const scene = new BABYLON.Scene(engine);

        // Automatically creates a default camera and light
        scene.createDefaultCameraOrLight(true, false, true);

        // Create the table
        const table = BABYLON.MeshBuilder.CreateBox("table", {
            width: 8, height: 0.3, depth: 5
        }, scene);
        table.position.y = -0.25; // Lower it slightly so it appears centered

        // Paddles' attributes
        const paddleWidth = 1, paddleHeight = 0.2, paddleDepth = 0.3;

        const leftPaddle = BABYLON.MeshBuilder.CreateBox("leftPaddle", {
            width: paddleWidth, height: paddleHeight, depth: paddleDepth
        }, scene);
        leftPaddle.position.set(-3.5, 0.2, 0); // Position on the left
        leftPaddle.rotation.y = Math.PI / 2; // Rotate 90 degrees

        const rightPaddle = BABYLON.MeshBuilder.CreateBox("rightPaddle", {
            width: paddleWidth, height: paddleHeight, depth: paddleDepth
        }, scene);
        rightPaddle.position.set(3.5, 0.2, 0); // Position on the right
        rightPaddle.rotation.y = Math.PI / 2; // Rotate 90 degrees

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
