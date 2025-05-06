import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useLoading } from '@/contexts/gameContext/LoadingContextProvider';

import { PlayerScoreBoard } from '@components';

import { useGameControls, useGameResult } from '@hooks';

import { createReadyInputMessage } from '@shared/messages';

import { MatchMakingCarousel } from '../components/game';
import GameplayCanvas from '../components/game/GameplayCanvas';
import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useUser } from '../contexts/user/UserContext';
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
    matchmakingState: { gameId },
    startGame,
    startMatchMaking,
  } = useWebSocketContext();
  const { loadingStates } = useLoading();
  const [loading, setLoading] = useState<boolean>(true);
  const { user } = useUser();
  const navigate = useNavigate();

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
    console.log('gameId: ', gameId);
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

  /**
   * for 1v1 online mode, subscribe to matchmaking connection
   */
  useEffect(() => {
    if (!lobby || !mode || !difficulty) return;
    if (lobby === 'random' && mode === '1v1' && difficulty === 'online') {
      startMatchMaking();
    }
  }, [lobby, mode, difficulty]);

  /**
   * for 1v1 online mode, send find_match message
   */
  useEffect(() => {
    if (connections.matchmaking !== 'connected') return;
    if (lobby === 'random' && mode === '1v1' && difficulty === 'online') {
      sendMessage('matchmaking', {
        type: 'find_match',
        payload: {
          mode: mode,
          difficulty: difficulty,
          user_id: user?.user_id,
          avatar_url: user?.avatar_url,
          display_name: user?.display_name,
        },
      });
    }
  }, [connections.matchmaking, gameId, user, mode, difficulty, lobby]);

  /**
   * if gameId is set, connect to game socket
   */
  useEffect(() => {
    if (!gameId) return;
    console.log('connecting to game socket');
    startGame();
    return () => {
      closeConnection('game');
    };
  }, [gameId]);

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
  console.log('gampage');

  // Set loading to false to render the game
  useEffect(() => {
    if (!gameId) return;
    if (!loadingStates.matchMakingAnimationLoading && !loadingStates.scoreBoardLoading) {
      setLoading(false);
    }
  }, [loadingStates, gameId]);

  useEffect(() => {
    if (!gameId || !localPlayerId) return;

    let isMounted = true; // Track if component is mounted

    if (!loading && gameStatus === 'waiting' && connections.game === 'connected') {
      if (isMounted) {
        console.log('GamePage: sending ready message');
        sendMessage('game', createReadyInputMessage(localPlayerId, true));
      }

      return () => {
        // Clean up if component unmounts
        isMounted = false;
      };
    }
  }, [loading, gameStatus, gameId, localPlayerId, sendMessage, connections.game]);

  useEffect(() => {
    if (!gameResult) return;
    navigate('/game-results', {
      state: { gameResult, playersData },
    });
  }, [gameResult, playersData]);

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

      {/* Render GameResults */}
      {/* {gameResult ? <GameResults result={gameResult} playersData={playersData} /> : null} */}

      {/* Render MatchMakingCarousel */}

      {!isGameCanvasActive && !gameResult && loading ? (
        <MatchMakingCarousel playersData={playersData}></MatchMakingCarousel>
      ) : null}
    </div>
  );
};

export default GamePage;
