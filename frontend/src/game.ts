type Paddle = {
  y: number;
  dy: number;
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
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;
  leftScore: number;
  rightScore: number;
  countdown: number;
  countdownInProgress: boolean;
};

let gameState: GameState;

export function initGame() {
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

  gameState = {
    canvas,
    ctx,
    paddleWidth: 10,
    paddleHeight: 80,
    ballSize: 10,
    paddleSpeed: 6,  
    ballSpeed: 2,   

    leftPaddle: { y: canvas.height / 2 - 40, dy: 0 },
    rightPaddle: { y: canvas.height / 2 - 40, dy: 0 },
    
    ball: { x: canvas.width / 2, y: canvas.height / 2, dx: 2, dy: 2 },
    
    leftScore: 0,
    rightScore: 0,
    countdown: 3,
    countdownInProgress: false,
  };

  console.log("Game initialized successfully.");
  gameLoop();
}

// Handle player movement
document.addEventListener("keydown", (e) => handleKeyPress(e, true));
document.addEventListener("keyup", (e) => handleKeyPress(e, false));

function handleKeyPress(event: KeyboardEvent, isKeyDown: boolean) {
  if (!gameState) return;
  
  const speed = isKeyDown ? gameState.paddleSpeed : 0;
  if (event.key === "w") gameState.leftPaddle.dy = -speed;
  if (event.key === "s") gameState.leftPaddle.dy = speed;
  if (event.key === "ArrowUp") gameState.rightPaddle.dy = -speed;
  if (event.key === "ArrowDown") gameState.rightPaddle.dy = speed;
}

function update(gameState: GameState) {
  if (gameState.countdownInProgress) return;

  gameState.leftPaddle.y = Math.max(0, Math.min(gameState.canvas!.height - gameState.paddleHeight, gameState.leftPaddle.y + gameState.leftPaddle.dy));
  gameState.rightPaddle.y = Math.max(0, Math.min(gameState.canvas!.height - gameState.paddleHeight, gameState.rightPaddle.y + gameState.rightPaddle.dy));

  gameState.ball.x += gameState.ball.dx;
  gameState.ball.y += gameState.ball.dy;

  if (gameState.ball.y <= 0 || gameState.ball.y + gameState.ballSize >= gameState.canvas!.height) {
    gameState.ball.dy *= -1;
  }

  if (
    (gameState.ball.x <= gameState.paddleWidth &&
      gameState.ball.y >= gameState.leftPaddle.y &&
      gameState.ball.y <= gameState.leftPaddle.y + gameState.paddleHeight) ||
    (gameState.ball.x + gameState.ballSize >= gameState.canvas!.width - gameState.paddleWidth &&
      gameState.ball.y >= gameState.rightPaddle.y &&
      gameState.ball.y <= gameState.rightPaddle.y + gameState.paddleHeight)
  ) {
    gameState.ball.dx *= -1;
  }

  if (gameState.ball.x < 0) {
    gameState.rightScore++;
    startCountdown(gameState);
  } else if (gameState.ball.x > gameState.canvas!.width) {
    gameState.leftScore++;
    startCountdown(gameState);
  }

  updateScoreUI(gameState);
}

function draw(gameState: GameState) {
  const { ctx, canvas, leftPaddle, rightPaddle, ball, paddleWidth, paddleHeight, ballSize, countdownInProgress, countdown } = gameState;
  if (!ctx) return;

  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim() || "white";
  ctx.clearRect(0, 0, canvas!.width, canvas!.height);

  ctx.fillStyle = primaryColor;
  ctx.fillRect(0, leftPaddle.y, paddleWidth, paddleHeight);
  ctx.fillRect(canvas!.width - paddleWidth, rightPaddle.y, paddleWidth, paddleHeight);
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
  document.getElementById("player-1-score")!.textContent = gameState.leftScore.toString();
  document.getElementById("player-2-score")!.textContent = gameState.rightScore.toString();
}

function startCountdown(gameState: GameState) {
  gameState.countdownInProgress = true;
  gameState.countdown = 3;

  let countdownInterval = setInterval(() => {
    gameState.countdown--;
    if (gameState.countdown <= 0) {
      clearInterval(countdownInterval);
      resetBall(gameState);
    }
  }, 1000);
}

function resetBall(gameState: GameState) {
  gameState.ball = { x: gameState.canvas!.width / 2, y: gameState.canvas!.height / 2, dx: gameState.ballSpeed, dy: gameState.ballSpeed };
  gameState.countdown = 3;
  gameState.countdownInProgress = false;
}

export function gameLoop() {
  if (!gameState.ctx) {
    console.error("Game loop stopped: No context found.");
    return;
  }
  update(gameState);
  draw(gameState);
  requestAnimationFrame(gameLoop);
}