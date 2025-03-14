import React, { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { CountDown, PlayerScoreBoard } from '@components';

import { useWebSocketContext } from '@services';
import { useFetchPlayerData } from '../hooks/useFetchPlayers';
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

  const playersData = useFetchPlayerData({
    gameState,
    gameId,
    mode,
    localPlayerId,
    connectionStatus,
  });

  useEffect(() => {
    if (!gameId) return;
    if (!animate) {
      setLoading(false);
    }
  }, [animate]);

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
      {connectionStatus === 'connected' && gameState.gameStatus !== 'finished' && !loading ? (
        <>
          <div className="h-[10%] flex justify-between items-center">
            <PlayerScoreBoard playersData={playersData} playerScores={playerScores} />
          </div>
          <div className="w-full h-full relative overflow-hidden border-2 opening border-primary">
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
