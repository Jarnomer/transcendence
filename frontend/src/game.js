"use strict";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = 600;
canvas.height = 400;
const paddleWidth = 10, paddleHeight = 80;
const ballSize = 10;
let paddleSpeed = 6; // Increased paddle speed for better gameplay
let ballSpeed = 2; // Increased ball speed to make it faster
let ball = { x: canvas.width / 2, y: canvas.height / 2, dx: ballSpeed, dy: ballSpeed };
let leftPaddle = { y: canvas.height / 2 - paddleHeight / 2, dy: 0 };
let rightPaddle = { y: canvas.height / 2 - paddleHeight / paddleHeight, dy: 0 };
let countdown = 3;
let countdownInProgress = false;
let leftScore = 0;
let rightScore = 0;
// Handle player movement
document.addEventListener("keydown", (e) => {
    if (e.key === "w")
        leftPaddle.dy = -paddleSpeed;
    if (e.key === "s")
        leftPaddle.dy = paddleSpeed;
    if (e.key === "ArrowUp")
        rightPaddle.dy = -paddleSpeed;
    if (e.key === "ArrowDown")
        rightPaddle.dy = paddleSpeed;
});
document.addEventListener("keyup", (e) => {
    if (e.key === "w" || e.key === "s")
        leftPaddle.dy = 0;
    if (e.key === "ArrowUp" || e.key === "ArrowDown")
        rightPaddle.dy = 0;
});
function update() {
    if (countdownInProgress)
        return;
    leftPaddle.y += leftPaddle.dy;
    rightPaddle.y += rightPaddle.dy;
    leftPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, leftPaddle.y));
    rightPaddle.y = Math.max(0, Math.min(canvas.height - paddleHeight, rightPaddle.y));
    ball.x += ball.dx;
    ball.y += ball.dy;
    if (ball.y <= 0 || ball.y + ballSize >= canvas.height)
        ball.dy *= -1;
    if ((ball.x <= paddleWidth && ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + paddleHeight) ||
        (ball.x + ballSize >= canvas.width - paddleWidth && ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + paddleHeight)) {
        ball.dx *= -1;
    }
    if (ball.x < 0) {
        rightScore++; // Right player scores
        startCountdown();
    }
    else if (ball.x > canvas.width) {
        leftScore++; // Left player scores
        startCountdown();
    }
    // Update scores in the new DOM structure
    const player1ScoreElem = document.getElementById("player-1-score");
    const player2ScoreElem = document.getElementById("player-2-score");
    if (player1ScoreElem && player2ScoreElem) {
        player1ScoreElem.textContent = leftScore.toString();
        player2ScoreElem.textContent = rightScore.toString();
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, leftPaddle.y, paddleWidth, paddleHeight);
    ctx.fillRect(canvas.width - paddleWidth, rightPaddle.y, paddleWidth, paddleHeight);
    ctx.fillRect(ball.x, ball.y, ballSize, ballSize);
    // Draw countdown if in progress
    if (countdownInProgress) {
        ctx.font = "48px Arial";
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
    }
}
function startCountdown() {
    countdownInProgress = true;
    let countdownInterval = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            resetBall();
        }
    }, 1000);
}
function resetBall() {
    ball = { x: canvas.width / 2, y: canvas.height / 2, dx: ballSpeed, dy: ballSpeed };
    countdown = 3;
    countdownInProgress = false;
}
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
