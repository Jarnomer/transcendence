import React, { useEffect, useRef, useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import ClipLoader from 'react-spinners/ClipLoader';

import { CountDown, PlayerScoreBoard } from '@components';

import { useWebSocketContext } from '@services';

import {
  useGameControls,
  useGameResult,
  useGameUser,
  useMatchmaking,
  useWebSocketSetup,
} from '@hooks';

import { createReadyInputMessage } from '../../../shared/messages';
import GameCanvas from '../components/game/GameCanvas';

export const GamePage: React.FC = () => {
  const { setUrl, gameState, gameStatus, connectionStatus, dispatch, sendMessage } =
    useWebSocketContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, difficulty } = location.state || {};

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
    if (localPlayerId && remotePlayerId) {
      sendMessage(createReadyInputMessage(localPlayerId, true));
    }
  }, [connectionStatus, gameId, localPlayerId, remotePlayerId, sendMessage]);

  useEffect(() => {
    if (!localPlayerId) return;
    if (gameStatus === 'waiting' && gameId) {
      sendMessage(createReadyInputMessage(localPlayerId, true));
    }
  }, [gameStatus, gameId, localPlayerId, remotePlayerId, sendMessage]);

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
    <div id="game-page" className=" w-full p-10 pt-0 flex flex-col overflow-hidden">
      {connectionStatus === 'connected' && gameState.gameStatus !== 'finished' ? (
        <>
          <div className="h-[10%] flex justify-between items-center">
            <PlayerScoreBoard gameState={gameState} playerScores={playerScores} />
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
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p>{getStatusMessage()}</p>
          <ClipLoader
            color={'primary'}
            size={50}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </div>
  );
};

export default GamePage;
