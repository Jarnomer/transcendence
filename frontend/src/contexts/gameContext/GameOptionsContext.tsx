// FlowContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

import { GameSettings, defaultGameSettings } from '@shared/types/gameTypes';

type GameOptionsContextType = {
  mode: string | null;
  setMode: React.Dispatch<React.SetStateAction<string | null>>;
  difficulty: string | null;
  setDifficulty: React.Dispatch<React.SetStateAction<string | null>>;
  lobby: string | null;
  setLobby: React.Dispatch<React.SetStateAction<string | null>>;
  queueId: string | null;
  setQueueId: React.Dispatch<React.SetStateAction<string | null>>;
  gameId: string | null;
  setGameId: React.Dispatch<React.SetStateAction<string | null>>;
  resetGameOptions: () => void;
  tournamentOptions: TournamentOptionsType | null;
  setTournamentOptions: React.Dispatch<React.SetStateAction<TournamentOptionsType | null>>;
  gameSettings: GameSettings;
  setGameSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
};

export type TournamentOptionsType = {
  playerCount: number;
  tournamentName: string;
  isPrivate: boolean;
  password: string | null;
};

export type GameOptionsType = {
  mode: string;
  difficulty: string;
  lobby: string;
  queueId: string | null;
  tournamentOptions: TournamentOptionsType | null;
};

const GameOptionsContext = createContext<GameOptionsContextType | undefined>(undefined);

export const GameOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [lobby, setLobby] = useState<string | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [tournamentOptions, setTournamentOptions] = useState<TournamentOptionsType | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultGameSettings);

  const resetGameOptions = () => {
    setMode(null);
    setDifficulty(null);
    setLobby(null);
    setQueueId(null);
    setGameId(null);
    setTournamentOptions(null);
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
        gameId,
        setGameId,
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
