import React, { useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { CountDown, PlayerScoreBoard } from '@components';

import { useLoading } from '@/contexts/gameContext/LoadingContextProvider';
import { useWebSocketContext } from '@services';
import { useFetchPlayerData } from '../hooks/useFetchPlayers';

import {
  useGameControls,
  useGameResult,
  useGameUser,
  useMatchmaking,
  useWebSocketSetup,
} from '@hooks';

import { createReadyInputMessage } from '../../../shared/messages';
import GameCanvas from '../components/game/GameCanvas';
import { MatchMakingCarousel } from '../components/game/MatchMakingCarousel';

export const GamePage: React.FC = () => {
  const { setUrl, gameState, gameStatus, connectionStatus, dispatch, sendMessage } =
    useWebSocketContext();

  const location = useLocation();
  const { loadingStates } = useLoading();
  const { mode, difficulty } = location.state || {};
  const [animate, setAnimate] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  //const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  // const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  //const [remotePlayerId, setRemotePlayerId] = useState<string | null>(null);

  const { userId, localPlayerId, remotePlayerId } = useGameUser(difficulty);
  useMatchmaking(mode, difficulty, setGameId);
  useWebSocketSetup(gameId, mode, difficulty, userId);
  useGameResult(gameStatus, gameId, gameState, dispatch, userId);
  useGameControls(localPlayerId, remotePlayerId);

  const playersData = useFetchPlayerData({
    gameState,
    gameId,
    mode,
    connectionStatus,
    gameStatus,
  });

  // MAKE SURE THAT THE MATCHMAKING CAROUSEL HAS FINISHED, AND THAT PLAYER SCOREBOARD IS INITALIZED
  // SET LOADING TO FALSE TO RENDER THE GAMECANVAS
  useEffect(() => {
    if (!gameId) return;
    if (!loadingStates.matchMakingAnimationLoading && !loadingStates.scoreBoardLoading) {
      setLoading(false);
    }
  }, [animate, loadingStates]);

  useEffect(() => {
    if (!gameId) return;
    if (!loading && gameStatus === 'waiting') {
      console.log('sending player ready for player: ', localPlayerId);
      sendMessage(createReadyInputMessage(localPlayerId, true));
    }
  }, [loading, gameStatus]);

  const getStatusMessage = () => {
    if (connectionStatus !== 'connected') {
      return `Connection: ${connectionStatus}`;
    }

    if (mode === 'singleplayer') {
      return 'Starting game...';
    }

    if (mode === '1v1') {
      return `Game Status: ${gameStatus}`;
    }
  };

  // TODO: Reconnection handler
  // TODO: Pause - Resume

  return (
    <div id="game-page" className="w-full p-10 pt-0 flex flex-col overflow-hidden">
      {!loadingStates.matchMakingAnimationLoading ? (
        <PlayerScoreBoard playersData={playersData} />
      ) : null}
      {connectionStatus === 'connected' && gameState.gameStatus !== 'finished' && !loading ? (
        <>
          <div className="w-full h-full relative overflow-hidden border-2 border-primary">
            {/* RENDER COUNTDOWN CONDITIONALLY */}
            <CountDown gameStatus={gameStatus} />

            <p className="text-xs text-gray-500">
              Connection: {connectionStatus} | Game: {gameStatus} | Spin: {gameState.ball.spin}
            </p>
            <GameCanvas gameState={gameState} />
          </div>
        </>
      ) : (
        <MatchMakingCarousel setAnimate={setAnimate} gameId={gameId} playersData={playersData} />
      )}
    </div>
  );
};

export default GamePage;

// <div className="flex flex-col items-center justify-center h-full gap-4">
//   <p>{getStatusMessage()}</p>
//   <ClipLoader
//     color={'primary'}
//     size={50}
//     aria-label="Loading Spinner"
//     data-testid="loader"
//   />
// </div>
