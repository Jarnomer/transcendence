
import { eventBus } from "./events";
import { GameGraphics } from "./babylon";

type Player = {
  id: string;
  y: number;
  score: number;
};

type Ball = {
  x: number;
  y: number;
  dx: number;
  dy: number;
};

type GameState = {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
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
  new GameGraphics('renderCanvas');
  if (!canvas) {
    console.error("Canvas not found!");
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("Canvas context is null!");
    return;
  }

  canvas.width = 800;
  canvas.height = 400;

  const gameStateInit = {
    canvas,
    ctx,
    paddleWidth: 10,
    paddleHeight: 80,
    ballSize: 10,
    paddleSpeed: 6,
    ballSpeed: 2,   

    players: {
      player1: { id: "player1", y: canvas.height / 2 - 40, score: 0 },
      player2: { id: "player2", y: canvas.height / 2 - 40, score: 0 },
    },

    ball: { x: canvas.width / 2, y: canvas.height / 2, dx: 2, dy: 2 },
    
    countdown: 3,
    countdownInProgress: false,
  };
  console.log("Game initialized successfully.");
  Object.assign(gameState, gameStateInit);
}

const keysPressed: Record<string, boolean> = {};

document.addEventListener("keydown", (e) => {
  keysPressed[e.key] = true;
});

document.addEventListener("keyup", (e) => {
  keysPressed[e.key] = false;
});

function update(gameState: GameState, ws: WebSocket) {
  if (gameState.countdownInProgress) return;

  if (ws.readyState === WebSocket.OPEN) {
    if (keysPressed["w"]) ws.send(JSON.stringify({ type: "move", playerId: "player1", move: "up" }));
    if (keysPressed["s"]) ws.send(JSON.stringify({ type: "move", playerId: "player1", move: "down" }));
    if (keysPressed["ArrowUp"]) ws.send(JSON.stringify({ type: "move", playerId: "player2", move: "up" }));
    if (keysPressed["ArrowDown"]) ws.send(JSON.stringify({ type: "move", playerId: "player2", move: "down" }));
  }
}


function draw(gameState: GameState) {
  const { ctx, canvas, players, ball, paddleWidth, paddleHeight, ballSize, countdownInProgress, countdown } = gameState;
  if (!ctx) return;
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "white";
  ctx.clearRect(0, 0, canvas!.width, canvas!.height);

  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, players["player1"].y, paddleWidth, paddleHeight);
  ctx.fillRect(canvas!.width - paddleWidth, players["player2"].y, paddleWidth, paddleHeight);
  ctx.fillRect(ball.x, ball.y, ballSize, ballSize);

  if (countdownInProgress) {
    ctx.font = "48px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(countdown.toString(), canvas!.width / 2, canvas!.height / 2);
  }
}

function updateScoreUI(gameState: GameState) {
  document.getElementById("player-1-score")!.textContent = gameState.players["player1"].score.toString();
  document.getElementById("player-2-score")!.textContent = gameState.players["player2"].score.toString();
}

eventBus.on("gameUpdate", draw);

let lastTime = 0; // Store the last timestamp to calculate deltaTime

export function gameLoop(ws: WebSocket, gameState: GameState, timestamp: number) {
  if (!gameState.ctx) {
    console.error("Game loop stopped: No context found.");
    return;
  }

  const deltaTime = (timestamp - lastTime) / 1000; // Convert to seconds
  lastTime = timestamp; // Update lastTime for the next frame

  update(gameState, ws); // Now update sends movement events properly
  draw(gameState);

  requestAnimationFrame((newTimestamp) => gameLoop(ws, gameState, newTimestamp));
}