import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

class PongGame {
    // Game elements
    private canvas: HTMLCanvasElement;
    private engine: BABYLON.Engine;
    private scene: BABYLON.Scene;

    // Game objects
    private camera: BABYLON.ArcRotateCamera;
    private light: BABYLON.HemisphericLight;
    private table: BABYLON.Mesh;
    private leftEdge: BABYLON.Mesh;
    private rightEdge: BABYLON.Mesh;
    private leftPaddle: BABYLON.Mesh;
    private rightPaddle: BABYLON.Mesh;
    private ball: BABYLON.Mesh;

    // Game state
    private leftScore: number = 0;
    private rightScore: number = 0;
    private ballVelocity: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);
    private gameState: 'countdown' | 'playing' | 'gameOver' = 'countdown';
    private countdownValue: number = 3;
    private countdownInterval: number | null = null;
    private scoreText: GUI.TextBlock;
    private countdownText: GUI.TextBlock;
    private winnerText: GUI.TextBlock;

    // Constants
    private readonly TABLE_WIDTH: number = 20;
    private readonly TABLE_HEIGHT: number = 12;
    private readonly PADDLE_WIDTH: number = 0.5;
    private readonly PADDLE_HEIGHT: number = 3;
    private readonly PADDLE_DEPTH: number = 0.5;
    private readonly BALL_SIZE: number = 0.5;
    private readonly BALL_SPEED: number = 0.1;
    private readonly PADDLE_SPEED: number = 0.3;
    private readonly EDGE_HEIGHT: number = 0.5;
    private readonly MAX_SCORE: number = 5;

    constructor(canvasId: string) {
        // Initialize canvas and engine
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);

        // Create scene
        this.scene = new BABYLON.Scene(this.engine);
        this.scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.1, 1);

        // Initialize game
        this.createScene();
        this.createUI();
        this.setupControls();

        // Start the game loop
        this.engine.runRenderLoop(() => {
            this.update();
            this.scene.render();
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            this.engine.resize();
        });

        // Start the countdown for the first round
        this.startCountdown();
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
        const bottomEdge = BABYLON.MeshBuilder.CreateBox(
            'bottomEdge',
            { width: this.TABLE_WIDTH, height: this.EDGE_HEIGHT, depth: 0.5 },
            this.scene
        );
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

        // Reset ball position
        this.resetBall();
    }

    private createUI(): void {
        // Create UI layer
        const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI', true, this.scene);

        // Create score text
        this.scoreText = new GUI.TextBlock();
        this.scoreText.text = `${this.leftScore} - ${this.rightScore}`;
        this.scoreText.color = 'white';
        this.scoreText.fontSize = 24;
        this.scoreText.top = '-40%';
        advancedTexture.addControl(this.scoreText);

        // Create countdown text
        this.countdownText = new GUI.TextBlock();
        this.countdownText.text = '';
        this.countdownText.color = 'white';
        this.countdownText.fontSize = 60;
        advancedTexture.addControl(this.countdownText);

        // Create winner text
        this.winnerText = new GUI.TextBlock();
        this.winnerText.text = '';
        this.winnerText.color = 'white';
        this.winnerText.fontSize = 40;
        advancedTexture.addControl(this.winnerText);
    }

    private setupControls(): void {
        // Setup keyboard controls
        const keyMap: { [key: string]: boolean } = {};

        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    keyMap[kbInfo.event.key] = true;
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    keyMap[kbInfo.event.key] = false;
                    break;
            }
        });

        // Update paddle positions on key press
        this.scene.registerBeforeRender(() => {
            if (this.gameState !== 'playing') return;

            // Left paddle controls
            if (keyMap['w'] || keyMap['W']) {
                this.leftPaddle.position.z += this.PADDLE_SPEED; // Clamp position
                if (this.leftPaddle.position.z + this.PADDLE_HEIGHT / 2 > this.TABLE_HEIGHT / 2) {
                    this.leftPaddle.position.z = this.TABLE_HEIGHT / 2 - this.PADDLE_HEIGHT / 2;
                }
            }
            if (keyMap['s'] || keyMap['S']) {
                this.leftPaddle.position.z -= this.PADDLE_SPEED; // Clamp position
                if (this.leftPaddle.position.z - this.PADDLE_HEIGHT / 2 < -this.TABLE_HEIGHT / 2) {
                    this.leftPaddle.position.z = -this.TABLE_HEIGHT / 2 + this.PADDLE_HEIGHT / 2;
                }
            }

            // Right paddle controls
            if (keyMap['ArrowUp']) {
                this.rightPaddle.position.z += this.PADDLE_SPEED; // Clamp position
                if (this.rightPaddle.position.z + this.PADDLE_HEIGHT / 2 > this.TABLE_HEIGHT / 2) {
                    this.rightPaddle.position.z = this.TABLE_HEIGHT / 2 - this.PADDLE_HEIGHT / 2;
                }
            }
            if (keyMap['ArrowDown']) {
                this.rightPaddle.position.z -= this.PADDLE_SPEED; // Clamp position
                if (this.rightPaddle.position.z - this.PADDLE_HEIGHT / 2 < -this.TABLE_HEIGHT / 2) {
                    this.rightPaddle.position.z = -this.TABLE_HEIGHT / 2 + this.PADDLE_HEIGHT / 2;
                }
            }
        });
    }

    private resetBall(): void {
        // Reset ball position to center
        this.ball.position = BABYLON.Vector3.Zero();

        // Randomize ball direction
        const angle = Math.random() * Math.PI * 2;
        this.ballVelocity = new BABYLON.Vector3(
            Math.cos(angle) * this.BALL_SPEED, 0,
            Math.sin(angle) * this.BALL_SPEED
        );

        // Ensure the ball has some horizontal movement
        if (Math.abs(this.ballVelocity.x) < 0.05) {
            this.ballVelocity.x = this.ballVelocity.x > 0 ? 0.05 : -0.05;
        }
    }

    private startCountdown(): void {
        this.gameState = 'countdown';
        this.countdownValue = 3;
        this.countdownText.text = this.countdownValue.toString();

        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        this.countdownInterval = setInterval(() => {
            this.countdownValue--;

            if (this.countdownValue > 0) {
                this.countdownText.text = this.countdownValue.toString();
            } else {
                this.countdownText.text = '';
                this.gameState = 'playing';
                clearInterval(this.countdownInterval!);
                this.countdownInterval = null;
            }
        }, 1000) as unknown as number;
    }

    private update(): void {
        if (this.gameState !== 'playing') return;

        // Update ball position
        this.ball.position.addInPlace(this.ballVelocity);

        // Check for collisions with top and bottom edges
        if (this.ball.position.z + this.BALL_SIZE / 2 > this.TABLE_HEIGHT / 2 ||
            this.ball.position.z - this.BALL_SIZE / 2 < -this.TABLE_HEIGHT / 2) {
            this.ballVelocity.z = -this.ballVelocity.z;
        }

        // Check for collision with left paddle
        if (this.ball.position.x - this.BALL_SIZE / 2 < this.leftPaddle.position.x + this.PADDLE_WIDTH / 2 &&
            this.ball.position.x + this.BALL_SIZE / 2 > this.leftPaddle.position.x - this.PADDLE_WIDTH / 2 &&
            this.ball.position.z + this.BALL_SIZE / 2 > this.leftPaddle.position.z - this.PADDLE_HEIGHT / 2 &&
            this.ball.position.z - this.BALL_SIZE / 2 < this.leftPaddle.position.z + this.PADDLE_HEIGHT / 2) {
            // Bounce off left paddle
            this.ballVelocity.x = -this.ballVelocity.x;

            // Add some randomness to the bounce
            this.ballVelocity.z += (Math.random() - 0.5) * 0.05;

            // Ensure the ball is not inside the paddle
            this.ball.position.x = this.leftPaddle.position.x + this.PADDLE_WIDTH / 2 + this.BALL_SIZE / 2;
        }

        // Check for collision with right paddle
        if (this.ball.position.x + this.BALL_SIZE / 2 > this.rightPaddle.position.x - this.PADDLE_WIDTH / 2 &&
            this.ball.position.x - this.BALL_SIZE / 2 < this.rightPaddle.position.x + this.PADDLE_WIDTH / 2 &&
            this.ball.position.z + this.BALL_SIZE / 2 > this.rightPaddle.position.z - this.PADDLE_HEIGHT / 2 &&
            this.ball.position.z - this.BALL_SIZE / 2 < this.rightPaddle.position.z + this.PADDLE_HEIGHT / 2) {
            // Bounce off right paddle
            this.ballVelocity.x = -this.ballVelocity.x;

            // Add some randomness to the bounce
            this.ballVelocity.z += (Math.random() - 0.5) * 0.05;

            // Ensure the ball is not inside the paddle
            this.ball.position.x = this.rightPaddle.position.x - this.PADDLE_WIDTH / 2 - this.BALL_SIZE / 2;
        }

        // Check if ball went past paddles
        if (this.ball.position.x < -this.TABLE_WIDTH / 2) {
            // Right player scores
            this.rightScore++;
            this.updateScore();
            this.checkGameOver();
        } else if (this.ball.position.x > this.TABLE_WIDTH / 2) {
            // Left player scores
            this.leftScore++;
            this.updateScore();
            this.checkGameOver();
        }
    }

    private updateScore(): void {
        this.scoreText.text = `${this.leftScore} - ${this.rightScore}`;

        if (this.gameState !== 'gameOver') {
            this.resetBall();
            this.startCountdown();
        }
    }

    private checkGameOver(): void {
        if (this.leftScore >= this.MAX_SCORE || this.rightScore >= this.MAX_SCORE) {
            this.gameState = 'gameOver';

            const winner = this.leftScore > this.rightScore ? 'Left' : 'Right';
            this.winnerText.text = `${winner} player wins!`;

            // Reset game after 5 seconds
            setTimeout(() => {
                this.resetGame();
            }, 5000);
        }
    }

    private resetGame(): void {
        this.leftScore = 0;
        this.rightScore = 0;
        this.updateScore();
        this.winnerText.text = '';
        this.resetBall();
        this.startCountdown();
    }
}

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
    new PongGame('renderCanvas');
});
