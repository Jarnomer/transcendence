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
  const { resetGameOptions, setMode, setDifficulty } = useGameOptionsContext();
  const { allowInternalNavigation } = useNavigationAccess();

  const [step, setStep] = useState<StepType>('init');

  const navigate = useNavigate();

  useEffect(() => {
    const sessionManager = SessionManager.getInstance();
    const gameId = sessionManager.get('gameId');
    const queueId = sessionManager.get('queueId');

    if (!gameId && !queueId) {
      console.log('No game or queue ID found in session.');
      setStep('done'); // No session to validate, skip loading
      return;
    }

    const validateSession = async () => {
      try {
        if (gameId) {
          console.log('Validating session...');
          const res = await getSessionStatus({ game_id: gameId || '', queue_id: queueId || '' });
          if (res.game_session) {
            setStep('validating'); // Validating session
            setMode(sessionManager.get('mode') || null);
            setDifficulty(sessionManager.get('difficulty') || null);
            setGameId(gameId || '');
          } else {
            sessionManager.remove('gameId');
            setStep('done'); // No ongoing game, clear session
          }
        }
        if (queueId) {
          if (res.queue_session) {
            setStep('validating'); // Restoring session
          } else {
            sessionManager.remove('queueId');
            setStep('done'); // No ongoing queue, clear session
          }
        }
      } catch (err) {
        console.error('[Session Check] Error:', err);
        sessionManager.clear(); // Optional: clear session on error
      }
    };

    validateSession();
  }, []);

  useEffect(() => {
    const sessionManager = SessionManager.getInstance();
    const gameId = sessionManager.get('gameId');
    const queueId = sessionManager.get('queueId');
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
        navigate('/game');
      } else {
        cancelQueueGame();
        resetGameOptions(); // <- sets mode/difficulty to null or default
        setStep('done');
      }
      // } else {
      // No queue/game, safe to proceed immediately
      // resetGameOptions(); // <- sets mode/difficulty to null or default
      // setReadyForNextEffect(true);
    }
  }, [step]);
  const isNewGame = step === 'done';
  return isNewGame;
};

export default useValidateSession;
