import React, { useEffect, useState } from 'react';

import { useLoading } from '@/contexts/gameContext/LoadingContextProvider';

import { CountDown, PlayerScoreBoard } from '@components';

import { useGameControls, useGameResult } from '@hooks';

import { createReadyInputMessage } from '@shared/messages';

import GameplayCanvas from '../components/game/GameplayCanvas';
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
    gameSocket,
    closeConnection,
    phase,
    startGame,
  } = useWebSocketContext();
  const { loadingStates } = useLoading();
  const [loading, setLoading] = useState<boolean>(true);

  const { mode, difficulty, tournamentOptions } = useGameOptionsContext();

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

    // Signal that we want to hide the background game
    // This will trigger the transition in UnifiedGameProvider
    hideBackgroundGame();

    return () => {
      // When unmounting, signal that we want to show the background game again
      showBackgroundGame();
      hideGameCanvas();
    };
  }, []);

  useEffect(() => {
    if (!phase.gameId) return;
    console.log('connecting to game socket');
    startGame();
    return () => {
      closeConnection('game');
    };
  }, [phase.gameId]);

  // Show game canvas when ready to play
  useEffect(() => {
    if (!loading && gameState && connections.game === 'connected' && gameStatus !== 'finished') {
      console.log('Game is ready to play, showing game canvas');
      if (!isGameCanvasVisible) {
        showGameCanvas();
      }
    }
  }, [loading, gameStatus, gameState, connections.game, isGameCanvasVisible, showGameCanvas]);

  // const { userId, localPlayerId, remotePlayerId } = useGameUser();
  // useMatchmaking(userId);
  useGameResult();
  const localPlayerId = useGameControls();
  const playersData = useFetchPlayerData();

  // SET LOADING TO FALSE TO RENDER THE GAME
  useEffect(() => {
    if (!phase.gameId) return;
    if (!loadingStates.matchMakingAnimationLoading && !loadingStates.scoreBoardLoading) {
      console.log('Setting loading to false - game ready to render');
      setLoading(false);
    }
  }, [loadingStates, phase.gameId]);

  useEffect(() => {
    if (!phase.gameId || !localPlayerId) return;

    let isMounted = true; // Track if component is mounted

    if (!loading && gameStatus === 'waiting' && connections.game === 'connected') {
      console.log('Ready to send player ready message');
      const readyMessageDelay = setTimeout(() => {
        if (isMounted) {
          console.log('Sending delayed player ready for player:', localPlayerId);
          sendMessage('game', createReadyInputMessage(localPlayerId, true));
        }
      }, 2000); // 2s delay

      // Clean up the timeout if component unmounts
      return () => {
        isMounted = false;
        clearTimeout(readyMessageDelay);
      };
    }
  }, [loading, gameStatus, phase.gameId, localPlayerId, sendMessage, connections.game]);

  return (
    <div
      id="game-page"
      className="w-full h-full pt-0 flex flex-col flex-grow items-center justify-center overflow-hidden"
    >
      {!loadingStates.matchMakingAnimationLoading ? (
        <PlayerScoreBoard playersData={playersData} />
      ) : null}

      {/* GameplayCanvas is always rendered but visibility is controlled */}
      <div
        className={`w-full h-full transition-opacity duration-1000 ${
          isGameCanvasVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {isGameCanvasActive && gameState && (
          <GameplayCanvas gameState={gameState} gameStatus={gameStatus} theme="dark" />
        )}
      </div>

      {/* Show countdown conditionally */}
      {connections.game === 'connected' && gameStatus !== 'finished' && !loading && gameState ? (
        <CountDown gameStatus={gameStatus} />
      ) : (
        <MatchMakingCarousel playersData={playersData} />
      )}
    </div>
  );
};

export default GamePage;
