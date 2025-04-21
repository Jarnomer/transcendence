// useTournamentStore.ts
import { useSyncExternalStore } from 'react';

import MatchmakingManager from '../MatchmakingManager';

export function useWebSocketStore() {
  const matchmakingManager = MatchmakingManager.getInstance();
  const phase = useSyncExternalStore(matchmakingManager.subscribe.bind(matchmakingManager), () =>
    matchmakingManager.getSnapshot()
  );

  return {
    phase,
    setGameId: matchmakingManager.setGameId.bind(matchmakingManager),
    cleanup: matchmakingManager.cleanup.bind(matchmakingManager),
    startMatchMaking: matchmakingManager.startMatchmaking.bind(matchmakingManager),
    startSpectating: matchmakingManager.startSpectating.bind(matchmakingManager),
    startGame: matchmakingManager.startGame.bind(matchmakingManager),
    setMatchmakingOptions: matchmakingManager.setMatchmakingOptions.bind(matchmakingManager),
  };
}
