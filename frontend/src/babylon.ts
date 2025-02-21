import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import { GameState } from './game';

export class GameGraphics {
    // Game elements
    private canvas: HTMLCanvasElement;
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;

    // Game objects
    private camera: BABYLON.ArcRotateCamera;
    private light: BABYLON.HemisphericLight;
    private table: BABYLON.Mesh;
    private leftPaddle: BABYLON.Mesh;
    private rightPaddle: BABYLON.Mesh;
    private ball: BABYLON.Mesh;

    // Constants
    private readonly TABLE_WIDTH: number = 20;
    private readonly TABLE_HEIGHT: number = 12;
    private readonly PADDLE_WIDTH: number = 0.5;
    private readonly PADDLE_HEIGHT: number = 3;
    private readonly PADDLE_DEPTH: number = 0.5;
    private readonly BALL_SIZE: number = 0.5;
    private readonly EDGE_HEIGHT: number = 0.5;

    constructor(canvas : HTMLCanvasElement, gameState: GameState) {
        // Initialize canvas and engine
        this.canvas = canvas;
        this.engine = new BABYLON.Engine(this.canvas, true);

        // Create scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1);

        // Initialize game
        this.createScene();

        // Start the game loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    private createScene(): void {
        // Create camera
        this.camera = new BABYLON.ArcRotateCamera('camera',
            Math.PI / 2,  // Alpha (rotation around Y axis)
            0,            // Beta (rotation around X axis)
            25,           // Radius (distance from target)
            new BABYLON.Vector3(0, 0, 0), this.scene);
        this.camera.setTarget(BABYLON.Vector3.Zero());
        this.camera.attachControl(this.canvas, true);

        // Lock the camera rotation
        this.camera.lowerBetaLimit = 0;
        this.camera.upperBetaLimit = 0;
        this.camera.lowerAlphaLimit = Math.PI / 2;
        this.camera.upperAlphaLimit = Math.PI / 2;

        // Create light
        this.light = new BABYLON.HemisphericLight('light',
            new BABYLON.Vector3(0, 1, 0), this.scene);
        this.light.intensity = 0.7;

        // Create table
        this.table = BABYLON.MeshBuilder.CreateBox('table', {
            width: this.TABLE_WIDTH, height: 0.1, depth: this.TABLE_HEIGHT
        }, this.scene);

        const tableMaterial = new BABYLON.StandardMaterial('tableMaterial', this.scene);
        tableMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
        this.table.material = tableMaterial;

        // Create top edge
        const topEdge = BABYLON.MeshBuilder.CreateBox('topEdge', {
            width: this.TABLE_WIDTH, height: this.EDGE_HEIGHT, depth: 0.5
        }, this.scene);
        topEdge.position.z = this.TABLE_HEIGHT / 2;

        const edgeTopMaterial = new BABYLON.StandardMaterial('edgeMaterial', this.scene);
        edgeTopMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        topEdge.material = edgeTopMaterial;

        // Create bottom edge
        const bottomEdge = BABYLON.MeshBuilder.CreateBox('bottomEdge',{
            width: this.TABLE_WIDTH, height: this.EDGE_HEIGHT, depth: 0.5
        }, this.scene);
        bottomEdge.position.z = -this.TABLE_HEIGHT / 2;

        const edgeBottomMaterial = new BABYLON.StandardMaterial('edgeMaterial', this.scene);
        edgeBottomMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        bottomEdge.material = edgeBottomMaterial;

        // Create left paddle
        this.leftPaddle = BABYLON.MeshBuilder.CreateBox('leftPaddle', {
            width: this.PADDLE_WIDTH, height: this.PADDLE_DEPTH, depth: this.PADDLE_HEIGHT
        }, this.scene);
        this.leftPaddle.position.x = -this.TABLE_WIDTH / 2 + 1;

        const leftPaddleMaterial = new BABYLON.StandardMaterial('leftPaddleMaterial', this.scene);
        leftPaddleMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
        this.leftPaddle.material = leftPaddleMaterial;

        // Create right paddle
        this.rightPaddle = BABYLON.MeshBuilder.CreateBox('rightPaddle', {
            width: this.PADDLE_WIDTH, height: this.PADDLE_DEPTH, depth: this.PADDLE_HEIGHT
        }, this.scene);
        this.rightPaddle.position.x = this.TABLE_WIDTH / 2 - 1;

        const rightPaddleMaterial = new BABYLON.StandardMaterial('rightPaddleMaterial', this.scene);
        rightPaddleMaterial.diffuseColor = new BABYLON.Color3(1, 0, 0);
        this.rightPaddle.material = rightPaddleMaterial;

        // Create ball
        this.ball = BABYLON.MeshBuilder.CreateSphere('ball', {
            diameter: this.BALL_SIZE
        }, this.scene);

        const ballMaterial = new BABYLON.StandardMaterial('ballMaterial', this.scene);
        ballMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        this.ball.material = ballMaterial;
    }
}
