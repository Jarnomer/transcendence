// FlowContext.tsx
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { defaultGameSettings, GameSettings, TournamentOptionsType } from '@shared/types/gameTypes';

import SessionManager from '../../services/SessionManager';
import { getGameSettings } from '../../services/userService';
import { useUser } from '../user/UserContext';
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
  confirmGame: boolean;
  setConfirmGame: React.Dispatch<React.SetStateAction<boolean>>;
};

const GameOptionsContext = createContext<GameOptionsContextType | undefined>(undefined);

export const GameOptionsProvider = ({ children }: { children: ReactNode }) => {
  const [lobby, setLobby] = useState<string | null>(null);
  const [mode, setMode] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [tournamentOptions, setTournamentOptions] = useState<TournamentOptionsType | null>(null);
  const [queueId, setQueueId] = useState<string | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultGameSettings);
  const [confirmGame, setConfirmGame] = useState(false);
  const { setGameOptions, cleanup } = useWebSocketContext();
  const { userId } = useUser();
  // const [gameId, setGameId] = useState<string | null>(null);
  // const [matchmakingOptions, setMatchmakingOptions] = useState<MatchmakingOptionsType | null>(null);

  useEffect(() => {
    console.log('GameOptionsContext mounted');
    console.log('mode: ', mode);
    console.log('difficulty: ', difficulty);
    console.log('lobby: ', lobby);
    console.log('queueId: ', queueId);
  }, [mode, difficulty, lobby, queueId]);

  useEffect(() => {
    if (!mode || !difficulty) return;
    console.log('setting sessions');
    const sessionManager = SessionManager.getInstance();
    sessionManager.set('mode', mode);
    sessionManager.set('difficulty', difficulty);
    if (queueId) sessionManager.set('queueId', queueId);
  }, [mode, difficulty, queueId]);

  useEffect(() => {
    if (!userId) return;
    console.info('Fetching game settings on mount');
    getGameSettings()
      .then((res) => {
        if (res && Object.keys(res).length > 0) {
          console.info('Game settings fetched successfully:', res);
          setGameSettings(res);
        } else {
          console.warn('No game settings found, using default settings');
          setGameSettings(defaultGameSettings);
        }
      })
      .catch((err) => {
        console.error('Error fetching game settings:', err);
      });
  }, [userId]);

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
    if (!mode || !difficulty || !lobby) return;
    setGameOptions({
      mode: mode,
      difficulty: difficulty,
      queueId: queueId ? queueId : '',
      lobby: lobby,
      tournamentOptions: tournamentOptions,
    });
  }, [mode, difficulty, lobby, queueId, tournamentOptions]);

  const resetGameOptions = () => {
    setMode(null);
    setDifficulty(null);
    setLobby('create');
    setQueueId(null);
    setTournamentOptions(null);
    setConfirmGame(false);
    cleanup();
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
        confirmGame,
        setConfirmGame,
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
