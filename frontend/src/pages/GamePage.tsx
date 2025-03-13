import React, { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { CountDown, PlayerScoreBoard } from '@components';

import { useWebSocketContext } from '@services';
import { useLoading } from './LoadingContextProvider';

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
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, difficulty } = location.state || {};
  const [animate, setAnimate] = useState<boolean>(false);
  const { loadingStates } = useLoading();
  const [loading, setLoading] = useState<boolean>(true);

  //const [userId, setUserId] = useState<string | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  // const [localPlayerId, setLocalPlayerId] = useState<string | null>(null);
  //const [remotePlayerId, setRemotePlayerId] = useState<string | null>(null);
  const playerScores = useRef({
    player1Score: gameState.players.player1?.score || 0,
    player2Score: gameState.players.player2?.score || 0,
  });

  const { userId, localPlayerId, remotePlayerId } = useGameUser(difficulty);
  useMatchmaking(mode, difficulty, setGameId);
  useWebSocketSetup(gameId, mode, difficulty, userId);
  useGameResult(gameStatus, gameId, gameState, dispatch, userId);
  useGameControls(localPlayerId, remotePlayerId);

  useEffect(() => {
    if (!gameId) return;
    console.log(localPlayerId);
    console.log(remotePlayerId);
    if (
      localPlayerId &&
      remotePlayerId &&
      !loadingStates.matchMakingAnimationLoading &&
      !loadingStates.scoreBoardLoading &&
      !animate
    ) {
      sendMessage(createReadyInputMessage(localPlayerId, true));
      setLoading(false);
    }
  }, [
    connectionStatus,
    gameId,
    localPlayerId,
    remotePlayerId,
    sendMessage,
    animate,
    loadingStates,
  ]);

  // useEffect(() => {
  //   if (!localPlayerId) return;
  //   if (gameStatus === 'waiting' && gameId) {
  //     sendMessage(createReadyInputMessage(localPlayerId, true));
  //   }
  // }, [gameStatus, gameId, localPlayerId, remotePlayerId, sendMessage]);

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
      {connectionStatus === 'connected' && gameState.gameStatus !== 'finished' && !animate ? (
        <>
          <div className="h-[10%] flex justify-between items-center">
            <PlayerScoreBoard playerScores={playerScores} />
          </div>
          <div className="w-full h-full relative overflow-hidden border-2 opening border-primary">
            {/* RENDER COUNTDOWN CONDITIONALLY */}
            <CountDown gameStatus={gameStatus} />

            <p className="text-xs text-gray-500">
              Connection: {connectionStatus} | Game: {gameStatus}
            </p>
            <GameCanvas gameState={gameState} />
          </div>
        </>
      ) : (
        <MatchMakingCarousel setAnimate={setAnimate} />
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
