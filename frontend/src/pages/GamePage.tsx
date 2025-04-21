import React, { useEffect, useRef, useState } from 'react';

import { useLoading } from '@/contexts/gameContext/LoadingContextProvider';

import { CountDown, GameCanvas, PlayerScoreBoard } from '@components';

import { useGameControls, useGameResult } from '@hooks';

import { createReadyInputMessage } from '@shared/messages';

import { MatchMakingCarousel } from '../components/game/MatchMakingCarousel';
import { useGameOptionsContext } from '../contexts/gameContext/GameOptionsContext';
import { useUser } from '../contexts/user/UserContext';
import { useWebSocketContext } from '../contexts/WebSocketContext';
import { useBackgroundGameVisibility } from '../hooks/useBackgroundGameVisibility';
import { useFetchPlayerData } from '../hooks/useFetchPlayers';

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
  const { mode, difficulty, lobby, tournamentOptions, gameSettings } = useGameOptionsContext();
  const { userId } = useUser();
  const { loadingStates } = useLoading();
  const [animate, setAnimate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { showBackgroundGame } = useBackgroundGameVisibility();
  const params = useRef<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    if (!mode || !difficulty) return;
    params.current = new URLSearchParams({ mode: mode, difficulty: difficulty });
  }, [mode, difficulty]);

  useEffect(() => {
    console.log('GamePage mounted');
    console.log('mode: ', mode);
    console.log('difficulty: ', difficulty);
    console.log('gameId: ', phase.gameId);
    console.log('setTournamentOptions', tournamentOptions);

    return () => {
      showBackgroundGame();
    };
  }, []);

  useEffect(() => {
    if (gameStatus === 'finished') {
      // When game finishes, show the background game again
      const timer = setTimeout(() => {
        showBackgroundGame();
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (connections.game !== 'connected') return;
    console.log('Game connected sending settings');
    sendMessage('game', {
      type: 'settings',
      settings: gameSettings,
    });
  }, [connections.game, gameSettings]);

  // const { localPlayerId, remotePlayerId } = useGameUser();
  // useMatchmaking();

  useEffect(() => {
    if (!phase.gameId) return;
    console.log('connecting to game socket');
    // params.current.set('user_id', userId);
    // params.current.set('token', localStorage.getItem('token') || '');
    // params.current.set('game_id', phase.gameId);
    // params.current.set('role', 'player');
    // gameSocket.connect(params.current);
    startGame();
    return () => {
      closeConnection('game');
    };
  }, [phase.gameId]);

  // useEffect(() => {
  //   if (lobby === 'random', mode === '1v1', difficulty === 'online') {
  //     console.log('Finding match');

  useGameResult();
  const localPlayerId = useGameControls();
  const playersData = useFetchPlayerData();

  // MAKE SURE THAT THE MATCHMAKING CAROUSEL HAS FINISHED, AND THAT PLAYER SCOREBOARD IS INITALIZED
  // SET LOADING TO FALSE TO RENDER THE GAMECANVAS
  useEffect(() => {
    if (!phase.gameId) return;
    if (!loadingStates.matchMakingAnimationLoading && !loadingStates.scoreBoardLoading) {
      setLoading(false);
    }
  }, [animate, loadingStates, phase.gameId]);

  useEffect(() => {
    if (!phase.gameId || !localPlayerId) return;

    let isMounted = true; // Track if component is mounted

    if (!loading && gameStatus === 'waiting' && connections.game === 'connected') {
      const readyMessageDelay = setTimeout(() => {
        if (isMounted) {
          console.log('Sending delayed player ready for player:', localPlayerId);
          sendMessage('game', createReadyInputMessage(localPlayerId, true));
        }
      }, 2000); // 2000ms delay

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
      className="w-full h-full p-15 pt-0 flex flex-col flex-grow items-center justify-center overflow-hidden"
    >
      {!loadingStates.matchMakingAnimationLoading ? (
        <PlayerScoreBoard playersData={playersData} />
      ) : null}
      {connections.game === 'connected' && gameStatus !== 'finished' && !loading && gameState ? (
        <>
          <div className="w-full h-full relative overflow-hidden">
            {/* RENDER COUNTDOWN CONDITIONALLY */}
            <CountDown gameStatus={gameStatus} />

            {/* SHOW GAME INFORMATION */}
            {/* <p className="text-xs text-gray-500"> */}
            {/*   Connection: {connections.game} | Game: {gameStatus} | Spin: {gameState?.ball.spin} | */}
            {/*   Player2_DY: {gameState?.players.player2.dy} */}
            {/* </p> */}
            <GameCanvas gameState={gameState} />
          </div>
        </>
      ) : (
        <MatchMakingCarousel playersData={playersData} />
      )}
    </div>
  );
};

export default GamePage;
