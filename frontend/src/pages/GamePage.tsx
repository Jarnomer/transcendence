import React, { useEffect, useState } from 'react';

import { useLoading } from '@/contexts/gameContext/LoadingContextProvider';

import { CountDown, PlayerScoreBoard } from '@components';

import { useGameControls, useGameResult, useGameUser, useMatchmaking } from '@hooks';

import { createReadyInputMessage } from '@shared/messages';

import GameplayCanvas from '../components/game/GameplayCanvas';
import { GameResults } from '../components/game/GameResults';
import { MatchMakingCarousel } from '../components/game/MatchMakingCarousel';
import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { useFetchPlayerData } from '../hooks/useFetchPlayers';
import { useGameVisibility } from '../hooks/useGameVisibility';

export const GamePage: React.FC = () => {
  const { gameState, gameStatus, connections, sendMessage } = useWebSocketContext();
  const { gameId, mode, difficulty, tournamentOptions, resetGameOptions } = useGameOptionsContext();
  const { loadingStates, setLoadingState } = useLoading();
  const [loading, setLoading] = useState<boolean>(true);

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
    console.log('gameId: ', gameId);
    console.log('tournamentOptions', tournamentOptions);

    hideBackgroundGame();

    return () => {
      showBackgroundGame();
      hideGameCanvas();
    };
  }, []);

  // Show game canvas when ready to play
  useEffect(() => {
    if (!loading && gameState && connections.game === 'connected' && gameStatus !== 'finished') {
      console.log('Game is ready to play, showing game canvas');
      if (!isGameCanvasVisible) {
        showGameCanvas();
      }
    }
  }, [loading, gameStatus, gameState, connections.game, isGameCanvasVisible, showGameCanvas]);

  const { userId, localPlayerId, remotePlayerId } = useGameUser();
  useMatchmaking(userId);
  const { gameResult } = useGameResult(userId);
  useGameControls(localPlayerId, remotePlayerId);
  const playersData = useFetchPlayerData();

  // Set loading to false to render the game
  useEffect(() => {
    if (!gameId) return;
    if (!loadingStates.matchMakingAnimationLoading && !loadingStates.scoreBoardLoading) {
      console.log('Setting loading to false - game ready to render');
      setLoading(false);
    }
  }, [loadingStates, gameId]);

  useEffect(() => {
    if (!gameId || !localPlayerId) return;

    let isMounted = true; // Track if component is mounted

    if (!loading && gameStatus === 'waiting' && connections.game === 'connected') {
      console.log('Ready to send player ready message');

      if (isMounted) {
        console.log('Sending player ready for player:', localPlayerId);
        sendMessage('game', createReadyInputMessage(localPlayerId, true));
      }

      return () => {
        // Clean up if component unmounts
        isMounted = false;
      };
    }
  }, [loading, gameStatus, gameId, localPlayerId, sendMessage, connections.game]);

  return (
    <div
      id="game-page"
      className="w-full h-auto max-h-full p-2 pt-0 flex flex-col items-center justify-center overflow-hidden"
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

      {/* Show countdown conditionally */}
      {connections.game === 'connected' && gameStatus !== 'finished' && !loading && gameState ? (
        <CountDown gameStatus={gameStatus} />
      ) : gameResult ? (
        <GameResults result={gameResult} playersData={playersData} />
      ) : (
        <MatchMakingCarousel playersData={playersData} />
      )}
    </div>
  );
};

export default GamePage;
