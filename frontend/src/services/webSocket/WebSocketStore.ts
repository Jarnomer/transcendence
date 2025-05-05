// useTournamentStore.ts
import { useSyncExternalStore } from 'react';

import { MatchmakingManager } from '@services';

export function useWebSocketStore() {
  const matchmakingManager = MatchmakingManager.getInstance();
  const matchmakingState = useSyncExternalStore(
    matchmakingManager.subscribe.bind(matchmakingManager),
    () => matchmakingManager.getSnapshot()
  );

  return {
    matchmakingState,
    setGameId: matchmakingManager.setGameId.bind(matchmakingManager),
    cleanup: matchmakingManager.cleanup.bind(matchmakingManager),
    startMatchMaking: matchmakingManager.startMatchmaking.bind(matchmakingManager),
    startSpectating: matchmakingManager.startSpectating.bind(matchmakingManager),
    startGame: matchmakingManager.startGame.bind(matchmakingManager),
    setGameOptions: matchmakingManager.setGameOptions.bind(matchmakingManager),
    cancelQueue: matchmakingManager.cancelQueue.bind(matchmakingManager),
    cancelGame: matchmakingManager.cancelGame.bind(matchmakingManager),
  };
}
