
import { eventBus } from "./events";

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

let lastKeyPressTime = 0;  // Store the last key press timestamp
const keyPressInterval = .500; // Minimum interval between key presses (in seconds)

function handleKeyPressWithDynamicThrottle(ws: WebSocket, e: KeyboardEvent, isPressed: boolean, gameState: GameState, deltaTime: number) {
  const currentTime = Date.now(); // Convert to seconds for deltaTime comparison

  // Calculate the time difference between key press updates (based on deltaTime)
  if (currentTime - lastKeyPressTime >= keyPressInterval * deltaTime) {
    // Update the game state (player movement or other changes)
    handleKeyPress(ws, e, isPressed, gameState); // This is your existing key press handler

    // Update the last key press time to control the rate of updates
    lastKeyPressTime = currentTime;
  }
}


function handleKeyPress(ws: WebSocket, event: KeyboardEvent, isKeyDown: boolean, gameState: GameState) {
  if (!gameState) return;
  if (ws && ws.readyState === WebSocket.OPEN && isKeyDown) {
    console.log("Key pressed:", event.key);
    if (event.key === "w") ws.send(JSON.stringify({ type: "move",playerId: "player1", move: "up" }));
    if (event.key === "s") ws.send(JSON.stringify({ type: "move", playerId: "player1", move: "down" }));
    if (event.key === "ArrowUp") ws.send(JSON.stringify({ type: "move", playerId: "player2", move: "up" }));
    if (event.key === "ArrowDown") ws.send(JSON.stringify({ type: "move", playerId: "player2", move: "down" }));
  }
}

function update(gameState: GameState, deltaTime: number) {
  if (gameState.countdownInProgress) return;
    // Example: update the ball's position based on its velocity and deltaTime
  updateScoreUI(gameState);
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

/* function startCountdown(gameState: GameState) {
  gameState.countdownInProgress = true;
  gameState.countdown = 3;

  let countdownInterval = setInterval(() => {
    gameState.countdown--;
    if (gameState.countdown <= 0) {
      clearInterval(countdownInterval);
      resetBall(gameState);
    }
  }, 1000);
} */

/* function resetBall(gameState: GameState) {
  gameState.ball = { x: gameState.canvas!.width / 2, y: gameState.canvas!.height / 2, dx: gameState.ballSpeed, dy: gameState.ballSpeed };
  gameState.countdown = 3;
  gameState.countdownInProgress = false;
} */


eventBus.on("gameUpdate", draw);


let lastTime = 0; // Store the last timestamp to calculate deltaTime

export function gameLoop(ws: WebSocket, gameState: GameState, timestamp: number) {
  if (!gameState.ctx) {
    console.error("Game loop stopped: No context found.");
    return;
  }
  const deltaTime = timestamp - lastTime; // Convert to seconds
  lastTime = timestamp; // Update lastTime for the next frame
  // Handle player movement
  document.addEventListener("keydown", (e) => handleKeyPressWithDynamicThrottle(ws, e, true, gameState, deltaTime));
  document.addEventListener("keyup", (e) => handleKeyPressWithDynamicThrottle(ws, e, false, gameState, deltaTime));
  update(gameState, deltaTime);
  draw(gameState);
  requestAnimationFrame((newTimestamp) => gameLoop(ws, gameState, newTimestamp));
}