import React, { useEffect, useState } from 'react';
import { GameStatus } from '../../../shared/gameTypes';

interface CountDownProps {
  gameStatus: GameStatus;
}

export const CountDown: React.FC<CountDownProps> = ({ gameStatus }) => {
  const [count, setCount] = useState<number>(3); // Start countdown from 3
  const [animate, setAnimate] = useState<boolean>(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  
  useEffect(() => {
    if (gameStatus === 'countdown') {
      setCount(3);
    }
  }, [gameStatus]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p
        className={`text-6xl relative font-bold text-white bg-black/10
        ${count > 0 ? 'animate-ping visible' : 'hidden'}
        ${animate ? '' : ''}`}
        data-score={count}
      >
        {count > 0 ? count : 'GO!'}
      </p>
    </div>
  );
};
