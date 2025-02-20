import { Ball, Player } from "./gameLogic";

export function getAIMove(ball: Ball, aiPaddle: Player, gameHeight: number, paddleHeight: number): "up" | "down" | null {
    const aiCenter = aiPaddle.y + paddleHeight / 2;
    const threshold = 10; // Small buffer to prevent jitter

    if (Math.abs(aiCenter - ball.y) < threshold) {
        return null; // No move needed if the AI is near the ball
    }

    return aiCenter < ball.y ? "down" : "up";
}
