// FlowContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import {
  defaultGameSettings,
  GameSettings,
  MatchmakingOptionsType,
  TournamentOptionsType,
  UserRole,
} from '@shared/types/gameTypes';

import { useWebSocketContext } from '../WebSocketContext';

type GameOptionsContextType = {
  mode: string | null;
  setMode: React.Dispatch<React.SetStateAction<string | null>>;
  difficulty: string | null;
  setDifficulty: React.Dispatch<React.SetStateAction<string | null>>;
  lobby: string | null;
  setLobby: React.Dispatch<React.SetStateAction<string | null>>;
  queueId: string | null;
  setQueueId: React.Dispatch<React.SetStateAction<string | null>>;
  resetGameOptions: () => void;
  tournamentOptions: TournamentOptionsType | null;
  setTournamentOptions: React.Dispatch<React.SetStateAction<TournamentOptionsType | null>>;
  gameSettings: GameSettings;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
};

const GameOptionsContext = createContext<GameOptionsContextType | undefined>(undefined);

export const GameOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [lobby, setLobby] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [tournamentOptions, setTournamentOptions] = useState<TournamentOptionsType | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultGameSettings);
  const { setMatchmakingOptions } = useWebSocketContext();
  // const [gameId, setGameId] = useState<string | null>(null);
  // const [matchmakingOptions, setMatchmakingOptions] = useState<MatchmakingOptionsType | null>(null);

  useEffect(() => {
    if (mode && difficulty) {
      setGameSettings((prev) => ({
        ...prev,
        mode: mode as '1v1' | 'singleplayer' | 'AIvsAI',
        difficulty: difficulty as 'easy' | 'normal' | 'brutal' | 'local' | 'online',
      }));
    }
  }, [mode, difficulty]);

  useEffect(() => {
    if (mode && difficulty) {
      setMatchmakingOptions({
        mode: mode,
        difficulty: difficulty,
        queueId: queueId ? queueId : '',
      });
    }
  }, [mode, difficulty]);

  const resetGameOptions = () => {
    setMode(null);
    setDifficulty(null);
    setLobby(null);
    setQueueId(null);
    // setGameId(null);
    setTournamentOptions(null);
    setGameSettings(defaultGameSettings);
  };

  return (
    <GameOptionsContext.Provider
      value={{
        mode,
        setMode,
        difficulty,
        setDifficulty,
        lobby,
        setLobby,
        queueId,
        setQueueId,
        resetGameOptions,
        tournamentOptions,
        setTournamentOptions,
        gameSettings,
        setGameSettings,
      }}
    >
      {children}
    </GameOptionsContext.Provider>
  );
};

export const useGameOptionsContext = (): GameOptionsContextType => {
  const context = useContext(GameOptionsContext);
  if (!context) throw new Error('useFlow must be used within a FlowProvider');
  return context;
};
