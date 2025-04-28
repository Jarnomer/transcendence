import React, { useEffect, useState, useRef } from 'react';

import { getGameSoundManager } from '@game/utils';

import { GameState, GameStatus } from '@shared/types';

interface GameInfoOverlayProps {
  gameStatus: GameStatus;
  gameState: GameState;
  showPlayMessage?: boolean;
  showScoreMessage?: boolean;
}

export const GameInfoOverlay: React.FC<GameInfoOverlayProps> = ({
  gameStatus,
  gameState,
  showPlayMessage = true,
  showScoreMessage = true,
}) => {
  const [count, setCount] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [animate, setAnimate] = useState<boolean>(true);
  const [priorityMessage, setPriorityMessage] = useState<boolean>(false);

  const soundManagerRef = useRef(getGameSoundManager());

  const prevStatusRef = useRef<GameStatus | null>(null);
  const prevCountRef = useRef<number | null>(null);

  const messageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const priorityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle status transitions
  useEffect(() => {
    if (prevStatusRef.current !== gameStatus) {
      if (prevStatusRef.current === 'countdown' && gameStatus === 'playing') {
        handleStartEvent();
      } else if (prevStatusRef.current === 'playing' && gameStatus === 'waiting') {
        handleScoreEvent();
      }

      prevStatusRef.current = gameStatus;
    }
  }, [gameStatus]);

  // Handle countdown updates
  useEffect(() => {
    if (gameStatus === 'countdown') {
      const countdown = gameState.countdown;
      if (!priorityMessage && countdown !== undefined && countdown <= 3) {
        // console.log(`GameInfoOverlay: Setting countdown ${countdown}`);

        if (prevCountRef.current !== countdown) {
          setAnimate(true);
          prevCountRef.current = countdown;

          if (animateTimeoutRef.current) {
            clearTimeout(animateTimeoutRef.current);
          }

          animateTimeoutRef.current = setTimeout(() => {
            setAnimate(false);
            animateTimeoutRef.current = null;
          }, 500);
        }

        setCount(countdown);
      }
    }
  }, [gameState, gameStatus, priorityMessage]);

  // Handle countdown sounds
  useEffect(() => {
    if (gameStatus !== 'countdown' || count === undefined || count > 3 || count < 1) return;

    switch (count) {
      case 3:
        soundManagerRef.current.playCountDown3Sound(1.0, 1.2);
        break;
      case 2:
        soundManagerRef.current.playCountDown2Sound(1.0, 1.0);
        break;
      case 1:
        soundManagerRef.current.playCountDown1Sound(1.0, 0.8);
        break;
    }
  }, [count, gameStatus]);

  useEffect(() => {
    return () => {
      // Clean up any timeouts on unmount
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      if (priorityTimeoutRef.current) {
        clearTimeout(priorityTimeoutRef.current);
      }
      if (animateTimeoutRef.current) {
        clearTimeout(animateTimeoutRef.current);
      }
    };
  }, []);

  const handleStartEvent = () => {
    if (showPlayMessage) {
      setMessage('PLAY');
      setAnimate(true);
      setPriorityMessage(true);

      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      if (priorityTimeoutRef.current) {
        clearTimeout(priorityTimeoutRef.current);
      }

      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
        setAnimate(false);
        messageTimeoutRef.current = null;
      }, 600);

      priorityTimeoutRef.current = setTimeout(() => {
        setPriorityMessage(false);
        priorityTimeoutRef.current = null;
      }, 800);
    }
    soundManagerRef.current.playGameStartSound();
  };

  const handleScoreEvent = () => {
    if (showScoreMessage) {
      setMessage('SCORE');
      setAnimate(true);
      setPriorityMessage(true);

      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      if (priorityTimeoutRef.current) {
        clearTimeout(priorityTimeoutRef.current);
      }

      messageTimeoutRef.current = setTimeout(() => {
        setMessage('');
        setAnimate(false);
        messageTimeoutRef.current = null;
      }, 600);

      priorityTimeoutRef.current = setTimeout(() => {
        setPriorityMessage(false);
        priorityTimeoutRef.current = null;
      }, 800);
    }
    soundManagerRef.current.playGameOverSound();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {priorityMessage && message ? (
        <p
          className={`text-6xl font-bold text-white bg-black/10 ${animate ? 'animate-ping' : ''}`}
          data-message={message}
        >
          {message}
        </p>
      ) : gameStatus === 'countdown' && count >= 1 && count <= 3 ? (
        <p
          className={`text-6xl font-bold text-white bg-black/10 ${animate ? 'animate-ping' : ''}`}
          data-count={count}
        >
          {count}
        </p>
      ) : message ? (
        <p
          className={`text-6xl font-bold text-white bg-black/10 ${animate ? 'animate-ping' : ''}`}
          data-message={message}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
};

export default GameInfoOverlay;
