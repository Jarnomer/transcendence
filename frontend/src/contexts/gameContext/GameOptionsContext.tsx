// FlowContext.tsx
import { createContext, ReactNode, useContext, useState } from 'react';

type GameOptionsContextType = {
  selectedMode: string | null;
  setSelectedMode: (mode: string) => void;
  selectedDifficulty: string | null;
  setSelectedDifficulty: (difficulty: string) => void;
  selectedLobby: string | null;
  setSelectedLobby: (lobby: string) => void;
  queueId: string | null;
  setQueueId: (queueId: string) => void;
  gameId: string | null;
  setGameId: (gameId: string) => void;
};

const GameOptionsContext = createContext<GameOptionsContextType | undefined>(undefined);

export const GameOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedLobby, setSelectedLobby] = useState<string | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  return (
    <GameOptionsContext.Provider
      value={{
        selectedMode,
        setSelectedMode,
        selectedDifficulty,
        setSelectedDifficulty,
        selectedLobby,
        setSelectedLobby,
        queueId,
        setQueueId,
        gameId,
        setGameId,
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
