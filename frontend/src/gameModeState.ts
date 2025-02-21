type GameMode = "ai" | "local" | "online";

class GameModeState {
  private gameMode: GameMode | null = null;
  private listeners: ((mode: GameMode | null) => void)[] = [];

  setGameMode(mode: GameMode) {
    this.gameMode = mode;
    this.notifyListeners();
  }

  getGameMode(): GameMode | null {
    return this.gameMode;
  }

  subscribe(listener: (mode: GameMode | null) => void) {
    this.listeners.push(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.gameMode));
  }
}

// Export a single instance for global use
export const gameModeState = new GameModeState();
