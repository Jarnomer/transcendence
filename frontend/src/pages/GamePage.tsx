import React, { useEffect, useState } from 'react';

import { useLoading } from '@/contexts/gameContext/LoadingContextProvider';

import { PlayerScoreBoard } from '@components';

import { useGameControls, useGameResult } from '@hooks';

import { createReadyInputMessage } from '@shared/messages';

import GameplayCanvas from '../components/game/GameplayCanvas';
import { GameResults } from '../components/game/GameResults';
import { MatchMakingCarousel } from '../components/game/MatchMakingCarousel';
import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { useFetchPlayerData } from '../hooks/useFetchPlayers';
import { useGameVisibility } from '../hooks/useGameVisibility';

export const GamePage: React.FC = () => {
  const {
    gameState,
    gameStatus,
    connections,
    sendMessage,
    closeConnection,
    phase,
    startGame,
    startMatchMaking,
  } = useWebSocketContext();
  const { loadingStates } = useLoading();
  const [loading, setLoading] = useState<boolean>(true);

  const { lobby, mode, difficulty, tournamentOptions, gameSettings } = useGameOptionsContext();

  const {
    hideBackgroundGame,
    showBackgroundGame,
    isGameCanvasActive,
    isGameCanvasVisible,
    showGameCanvas,
    hideGameCanvas,
  } = useGameVisibility();

  useEffect(() => {
    console.log('GamePage mounted');
    console.log('mode: ', mode);
    console.log('difficulty: ', difficulty);
    console.log('gameId: ', phase.gameId);
    console.log('tournamentOptions', tournamentOptions);
    console.log('lobby ', lobby);

    hideBackgroundGame();

    return () => {
      showBackgroundGame();
      hideGameCanvas();
    };
  }, []);

  // Show game canvas when ready to play
  useEffect(() => {
    if (!loading && gameState && connections.game === 'connected' && gameStatus !== 'finished') {
      if (!isGameCanvasVisible) {
        showGameCanvas();
      }
    }
  }, [loading, gameStatus, gameState, connections.game, isGameCanvasVisible, showGameCanvas]);

  useEffect(() => {
    if (!phase.gameId) return;
    console.log('connecting to game socket');
    startGame();
    return () => {
      closeConnection('game');
    };
  }, [phase.gameId]);

  useEffect(() => {
    if (!lobby || !mode || !difficulty) return;
    if (lobby === 'random' && mode === '1v1' && difficulty === 'online') {
      startMatchMaking();
    }
  }, [lobby, mode, difficulty]);

  useEffect(() => {
    if (connections.game !== 'connected') return;
    console.log('Game connected sending settings');
    sendMessage('game', {
      type: 'settings',
      settings: gameSettings,
    });
  }, [connections.game, gameSettings]);

  const localPlayerId = useGameControls();
  const { gameResult } = useGameResult();

  const playersData = useFetchPlayerData();

  // Set loading to false to render the game
  useEffect(() => {
    if (!phase.gameId) return;
    if (!loadingStates.matchMakingAnimationLoading && !loadingStates.scoreBoardLoading) {
      setLoading(false);
    }
  }, [loadingStates, phase.gameId]);

  useEffect(() => {
    if (!phase.gameId || !localPlayerId) return;

    let isMounted = true; // Track if component is mounted

    if (!loading && gameStatus === 'waiting' && connections.game === 'connected') {
      if (isMounted) {
        sendMessage('game', createReadyInputMessage(localPlayerId, true));
      }

      return () => {
        // Clean up if component unmounts
        isMounted = false;
      };
    }
  }, [loading, gameStatus, phase.gameId, localPlayerId, sendMessage, connections.game]);

  return (
    <div
      id="game-page"
      className="w-full h-full p-2 pt-0 flex flex-col items-center justify-center overflow-hidden"
    >
      {!loadingStates.matchMakingAnimationLoading ? (
        <PlayerScoreBoard playersData={playersData} />
      ) : null}

      {/* GameplayCanvas is always rendered but visibility is controlled */}
      <div
        className={`w-full transition-opacity duration-1000 ${
          isGameCanvasVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {isGameCanvasActive && gameState && gameStatus !== 'finished' && !gameResult && (
          <GameplayCanvas gameState={gameState} gameStatus={gameStatus} theme="dark" />
        )}
      </div>

      {/* Render GameResults or MatchMakingCarousel */}
      {gameResult ? (
        <GameResults result={gameResult} playersData={playersData} />
      ) : (
        connections.game !== 'connected' && <MatchMakingCarousel playersData={playersData} />
      )}
    </div>
  );
};

export default GamePage;
