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

        // Table attributes
        const tableWidth = 8, tableHeight = 0.2, tableDepth = 6;

        // Create the table
        const table = BABYLON.MeshBuilder.CreateBox("table", {
            width: tableWidth, height: tableHeight, depth: tableDepth
        }, scene);
        table.position.y = -0.25; // Lower it slightly so it appears centered

        // Paddle attributes
        const paddleWidth = 1, paddleHeight = 0.2, paddleDepth = 0.3;

        const createPaddle = (name: string, xPosition: number) => {
            const paddle = BABYLON.MeshBuilder.CreateBox(name, {
                width: paddleWidth, height: paddleHeight, depth: paddleDepth
            }, scene);
            paddle.position.set(xPosition, 0.2, 0);
            paddle.rotation.y = Math.PI / 2;

            // Make paddle transparent
            const transparentMaterial = new BABYLON.StandardMaterial(`${name}Mat`, scene);
            transparentMaterial.alpha = 0.3; // Adjust transparency level
            paddle.material = transparentMaterial;

            // Enable edges rendering for neon effect
            paddle.enableEdgesRendering();
            paddle.edgesWidth = 4.0; // Thickness of neon effect
            paddle.edgesColor = new BABYLON.Color4(0, 1, 0, 1); // Neon green color

            return paddle;
        };

        const leftPaddle = createPaddle("leftPaddle", -3.5);
        const rightPaddle = createPaddle("rightPaddle", 3.5);

        // Create sphere (ball) at the center of the table
        const ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 0.3 }, scene);
        ball.position.set(0, 0.2, 0);

        // Create bars at the edges of the table
        const barHeight = 0.5, barDepth = 0.3;
        const createBar = (name: string, zPosition: number) => {
            const bar = BABYLON.MeshBuilder.CreateBox(name, { width: 8, height: barHeight, depth: barDepth }, scene);
            bar.position.set(0, 0, zPosition);
            return bar;
        };

        const topBar = createBar("topBar", -3);
        const bottomBar = createBar("bottomBar", 3);

        // Paddle movement
        const paddleSpeed = 0.2;
        window.addEventListener("keydown", (event) => {
            switch (event.key) {
                case "w":
                    leftPaddle.position.z -= paddleSpeed;
                    break;
                case "s":
                    leftPaddle.position.z += paddleSpeed;
                    break;
                case "ArrowUp":
                    rightPaddle.position.z -= paddleSpeed;
                    break;
                case "ArrowDown":
                    rightPaddle.position.z += paddleSpeed;
                    break;
            }
        });

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
