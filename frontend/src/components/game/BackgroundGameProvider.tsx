import React, { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { GameState, defaultGameParams } from '@shared/types';

import BackgroundGameCanvas from './BackgroundGameCanvas';

const BackgroundGameProvider: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const location = useLocation();

  // Initialize default values before WebSocket connects
  const initialGameState: GameState = {
    players: {
      player1: {
        id: 'player1',
        y: defaultGameParams.gameHeight / 2 - defaultGameParams.paddleHeight / 2,
        dy: 0,
        paddleHeight: defaultGameParams.paddleHeight,
        score: 0,
      },
      player2: {
        id: 'player2',
        y: defaultGameParams.gameHeight / 2 - defaultGameParams.paddleHeight / 2,
        paddleHeight: defaultGameParams.paddleHeight,
        dy: 0,
        score: 0,
      },
    },
    ball: {
      x: defaultGameParams.gameWidth / 2,
      y: defaultGameParams.gameHeight / 2,
      dx: 5,
      dy: 3,
      spin: 0,
    },
  };

  useEffect(() => {
    // Hide background game when on the game page
    console.log('Location changed:', location.pathname);
    if (location.pathname.includes('/game')) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isVisible) return;
    console.log('Background game provider mounted');
    const token = localStorage.getItem('token');
    const ws = new WebSocket(`wss://${window.location.host}/ws/background-game?`);
    ws.onopen = () => {
      console.log('WebSocket connection established');
    };
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received background game messages:', data);
        if (data.type === 'game_state') {
          setGameState(data.state);
        }
      } catch (error) {
        console.error('Error parsing background game message:', error);
      }
    };

    return () => {
      //  ws.close();
    };
  }, [isVisible]);

  return (
    <div
      className="background-game-container"
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    >
      <BackgroundGameCanvas gameState={gameState || initialGameState} isVisible={isVisible} />
    </div>
  );
};

export default BackgroundGameProvider;
