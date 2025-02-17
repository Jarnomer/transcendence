const PongGame = require("./gameLogic");

class GameManager {
  constructor() {
    this.games = {}; // Store multiple games
    this.clients = {}; // Store WebSocket clients
    this.intervals = {}; // Store game loops
  }

  createGame(gameId) {
    this.games[gameId] = new PongGame();
    this.clients[gameId] = new Set();

    // Start the game loop (e.g., 60 FPS)
    this.intervals[gameId] = setInterval(() => {
      this.updateGame(gameId);
    }, 1000 / 60);
  }

  addClient(gameId, ws) {
    if (!this.clients[gameId]) this.clients[gameId] = new Set();
    this.clients[gameId].add(ws);

    ws.on("close", () => {
      this.clients[gameId].delete(ws);
      if (this.clients[gameId].size === 0) {
        this.endGame(gameId);
      }
    });
  }

  updateGame(gameId) {
    if (!this.games[gameId]) return;

    const updatedState = this.games[gameId].updateGameStatus({}); // No player input, just physics updates
    this.broadcast(gameId, { type: "update", state: updatedState });
  }

  handlePlayerMove(gameId, player, move) {
    if (!this.games[gameId]) return null;

    const commands = {};
    commands[player] = move;

    this.games[gameId].updateGameStatus(commands);
  }

  broadcast(gameId, message) {
    if (!this.clients[gameId]) return;
    for (const client of this.clients[gameId]) {
      if (client.readyState === 1) {
        client.send(JSON.stringify(message));
      }
    }
  }

  endGame(gameId) {
    if (this.intervals[gameId]) {
      clearInterval(this.intervals[gameId]);
      delete this.intervals[gameId];
    }
    delete this.games[gameId];
    delete this.clients[gameId];
  }
}

module.exports = GameManager;
