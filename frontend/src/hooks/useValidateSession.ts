import { useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext, useNavigationAccess, useWebSocketContext } from '@contexts';

import { SessionManager, getSessionStatus } from '@services';

import { useConfirm } from '@hooks';

type StepType = 'init' | 'validating' | 'restoring' | 'done';

export const useValidateSession = () => {
  const { cancelGame, cancelQueue, setGameId, cleanup } = useWebSocketContext();
  const { resetGameOptions, setMode, setDifficulty, setQueueId } = useGameOptionsContext();
  const { allowInternalNavigation } = useNavigationAccess();
  const delayRef = useRef<NodeJS.Timeout | null>(null);

  const [step, setStep] = useState<StepType>('init');
  const sessionManager = SessionManager.getInstance();
  const gameId = sessionManager.get('gameId');
  const queueId = sessionManager.get('queueId');

  const { confirm } = useConfirm();

  const navigate = useNavigate();

  const validateSession = async () => {
    try {
      const res = await getSessionStatus({ game_id: gameId || '', queue_id: queueId || '' });
      console.log('Validating session...');
      console.log('Session validation response:', res);
      if (res.game_session) {
        setStep('validating'); // Validating session
        console.log('mode:', sessionManager.get('mode'));
        console.log('difficulty:', sessionManager.get('difficulty'));
        setMode(sessionManager.get('mode') || null);
        setDifficulty(sessionManager.get('difficulty') || null);
        setGameId(gameId || '');
      } else if (res.queue_session) {
        setStep('validating'); // Restoring session
        setMode(sessionManager.get('mode') || null);
        setDifficulty(sessionManager.get('difficulty') || null);
        setQueueId(queueId || '');
      } else {
        sessionManager.clear();
        resetGameOptions(); // Reset game options
        cleanup();
        setStep('done'); // No ongoing queue, clear session
      }
    } catch (err) {
      console.error('[Session Check] Error:', err);
      sessionManager.clear(); // Optional: clear session on error
    }
  };

  useEffect(() => {
    if (!gameId && !queueId) {
      console.log('No game or queue ID found in session.');
      resetGameOptions(); // Reset game options if no session
      sessionManager.clear(); // Clear session
      setStep('done'); // No session to validate, skip loading

      return;
    }
    if (delayRef.current) {
      clearTimeout(delayRef.current);
    }
    delayRef.current = setTimeout(() => {
      console.log('Validating session...');
      validateSession();
    }, 1000); // Delay for 1 second before validating session
    return () => {
      if (delayRef.current) {
        clearTimeout(delayRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const cancelQueueGame = async () => {
      console.log('Canceling queue/game...', gameId, queueId);
      if (gameId) {
        console.log('Canceling game...');
        await cancelGame();
      } else if (queueId) {
        console.log('Canceling queue...');
        await cancelQueue();
      }
    };

    const run = async () => {
      if (step === 'validating') {
        console.log('confirming');
        const userConfirmed = await confirm('You are already in a game or queue. Continue?');

        console.log(userConfirmed);
        if (userConfirmed) {
          allowInternalNavigation();
          if (gameId) {
            console.log('Game ID found:', gameId);
            navigate('/game');
          } else {
            console.log('Queue ID found:', queueId);
            navigate('/tournamentLobby');
          }
        } else {
          console.log('User declined to continue.');
          cancelQueueGame().then(() => {
            console.log('Queue/game canceled.');
            sessionManager.clear(); // Clear session
            setStep('done'); // Set step to done after canceling
            resetGameOptions(); // Reset game options
          });
        }
      }
    };

    run();
  }, [step]);

  const isNewGame = step === 'done';

  return isNewGame;
};
