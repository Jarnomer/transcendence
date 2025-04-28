import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { getSessionStatus } from '@/services/gameService';

import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useNavigationAccess } from '../contexts/navigationAccessContext/NavigationAccessContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import SessionManager from '../services/SessionManager';
type StepType = 'init' | 'validating' | 'restoring' | 'done';

const useValidateSession = () => {
  const { cancelGame, cancelQueue, setGameId } = useWebSocketContext();
  const { resetGameOptions, setMode, setDifficulty, setQueueId } = useGameOptionsContext();
  const { allowInternalNavigation } = useNavigationAccess();

  const [step, setStep] = useState<StepType>('init');
  const sessionManager = SessionManager.getInstance();
  const gameId = sessionManager.get('gameId');
  const queueId = sessionManager.get('queueId');

  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId && !queueId) {
      console.log('No game or queue ID found in session.');
      resetGameOptions(); // Reset game options if no session
      setStep('done'); // No session to validate, skip loading
      return;
    }

    const validateSession = async () => {
      try {
        const res = await getSessionStatus({ game_id: gameId || '', queue_id: queueId || '' });
        console.log('Validating session...');
        console.log('Session validation response:', res);
        if (res.game_session) {
          setStep('validating'); // Validating session
          setMode(sessionManager.get('mode') || null);
          setDifficulty(sessionManager.get('difficulty') || null);
          setGameId(gameId || '');
        } else if (res.queue_session) {
          setStep('validating'); // Restoring session
          setQueueId(queueId || '');
        } else {
          sessionManager.remove('gameId');
          setStep('done'); // No ongoing game, clear session
          sessionManager.remove('queueId');
          setStep('done'); // No ongoing queue, clear session
        }
      } catch (err) {
        console.error('[Session Check] Error:', err);
        sessionManager.clear(); // Optional: clear session on error
      }
    };

    validateSession();
  }, []);

  useEffect(() => {
    const cancelQueueGame = async () => {
      if (gameId) {
        await cancelGame();
      } else if (queueId) {
        await cancelQueue();
      }
    };

    if (step === 'validating') {
      const confirm = window.confirm('You are already in a game or queue. continue?');
      if (confirm) {
        allowInternalNavigation();
        if (gameId) {
          navigate('/game');
        } else if (queueId) {
          navigate('/tournamentLobby');
        }
      } else {
        cancelQueueGame();
        resetGameOptions(); // <- sets mode/difficulty to null or default
        setStep('done');
      }
    } else {
      setStep('done'); // No session to validate, skip loading
      resetGameOptions(); // Reset game options if no session
      sessionManager.clear(); // Clear session
    }
  }, [step]);
  const isNewGame = step === 'done';
  return isNewGame;
};

export default useValidateSession;
