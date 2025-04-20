import React, { useRef } from 'react';

import { useNavigate } from 'react-router-dom';

import { GameState } from '@types';

import { useGameOptionsContext } from '../../contexts/gameContext/GameOptionsContext';
import { useWebSocketContext } from '../../contexts/WebSocketContext';

interface MatchMakingCarouselProps {
  userId: string | null;
}

export const GameResults: React.FC<MatchMakingCarouselProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { resetGameOptions, gameId, mode } = useGameOptionsContext();
  const { closeConnection, gameStatus, gameState, dispatch } = useWebSocketContext();
  const gameIdRef = useRef<string | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const userIdRef = useRef(userId);
  const gameStatusRef = useRef(gameStatus);

  const { players } = gameStateRef.current;
  const playerArray = [players.player1, players.player2];
  const winnerIndex = playerArray.findIndex((e) => e.id !== userIdRef.current);
  const loserIndex = winnerIndex === 0 ? 1 : 0;
  console.log('Submitting game result:', gameIdRef.current, playerArray, winnerIndex, loserIndex);

  return (
    <>
      <div className="flex w-full relative justify-center items-center gap-5"></div>
    </>
  );
};
