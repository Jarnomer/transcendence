import {
  Engine, Scene,
  MeshBuilder, StandardMaterial,
  FreeCamera, HemisphericLight,
  Color3, Vector3
} from 'babylonjs';

type Player = {
  id: string;
  y: number;
  score: number;
  mesh?: any;
};

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  mesh?: any;
};

export type GameState = {
  canvas: HTMLCanvasElement | null;
  engine?: Engine;
  scene?: Scene;
  paddleWidth: number;
  paddleHeight: number;
  ballSize: number;
  paddleSpeed: number;
  ballSpeed: number;
  players: Record<string, Player>;
  ball: Ball;
  countdown: number;
  countdownInProgress: boolean;
};

export function initGame(gameState: GameState) {
  const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  if (!canvas) {
    console.error("Canvas not found!");
    return;
  }

  canvas.width = 800;
  canvas.height = 400;

  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  const camera = new FreeCamera("camera", new Vector3(0, 5, -10), scene);
  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  const paddleMaterial = new StandardMaterial("paddleMat", scene);

  const gameStateInit = {
    canvas,
    engine,
    scene,

    paddleWidth: 0.5,
    paddleHeight: 2,
    ballSize: 0.5,
    paddleSpeed: 0.1,
    ballSpeed: 0.05,

    players: {
      player1: {
        id: "player1",
        y: 0,
        score: 0,
        mesh: MeshBuilder.CreateBox("paddle1", {
          height: 2, width: 0.5, depth: 0.5
        }, scene)
      },
      player2: {
        id: "player2",
        y: 0,
        score: 0,
        mesh: MeshBuilder.CreateBox("paddle2", {
          height: 2, width: 0.5, depth: 0.5
        }, scene)
      }
    },

    ball: {
      x: 0,
      y: 0,
      dx: 0.05,
      dy: 0.05,
      mesh: MeshBuilder.CreateSphere("ball", {
        diameter: 0.5
      }, scene)
    },

    countdown: 3,
    countdownInProgress: false,
  };

  camera.setTarget(Vector3.Zero());
  camera.attachControl(canvas, true);
  light.intensity = 0.7;
  paddleMaterial.diffuseColor = Color3.White();
  gameStateInit.players.player1.mesh.position.x = -4;
  gameStateInit.players.player2.mesh.position.x = 4;
  gameStateInit.players.player1.mesh.material = paddleMaterial;
  gameStateInit.players.player2.mesh.material = paddleMaterial;
  gameStateInit.ball.mesh.material = paddleMaterial;

  Object.assign(gameState, gameStateInit);

  engine.runRenderLoop(() => {
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });

  console.log("Game initialized successfully.");
}

const keysPressed: Record<string, boolean> = {};

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

function updateScene(gameState: GameState, ws: WebSocket) {
  if (gameState.countdownInProgress) return;

  gameState.ball.mesh.position.x += gameState.ball.dx;
  gameState.ball.mesh.position.y += gameState.ball.dy;

  if (ws.readyState === WebSocket.OPEN) {
    if (keysPressed["w"]) {
      gameState.players.player1.mesh.position.y += gameState.paddleSpeed;
      ws.send(JSON.stringify({ type: "move", playerId: "player1", move: "up" }));
    }
    if (keysPressed["s"]) {
      gameState.players.player1.mesh.position.y -= gameState.paddleSpeed;
      ws.send(JSON.stringify({ type: "move", playerId: "player1", move: "down" }));
    }
    if (keysPressed["ArrowUp"]) {
      gameState.players.player2.mesh.position.y += gameState.paddleSpeed;
      ws.send(JSON.stringify({ type: "move", playerId: "player2", move: "up" }));
    }
    if (keysPressed["ArrowDown"]) {
      gameState.players.player2.mesh.position.y -= gameState.paddleSpeed;
      ws.send(JSON.stringify({ type: "move", playerId: "player2", move: "down" }));
    }
  }
}

export function gameLoop(gameState: GameState, ws: WebSocket) {
  if (!gameState.scene || !gameState.engine) {
    console.error("Game loop stopped: No scene or engine found.");
    return;
  }
  updateScene(gameState, ws);
  requestAnimationFrame(() => gameLoop(gameState, ws));
}
