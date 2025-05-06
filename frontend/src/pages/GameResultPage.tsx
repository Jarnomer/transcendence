import { Navigate, useLocation } from 'react-router-dom';

import { GameResults } from '@components/game/GameResults';

export const GameResultPage: React.FC = () => {
  const location = useLocation();
  const { gameResult, playersData } = location.state || {};

  if (!gameResult || !playersData) {
    return <Navigate to="/" />; // Redirect or show an error
  }

  return <GameResults result={gameResult} playersData={playersData} />;
};
