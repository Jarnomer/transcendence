import React, { useState, useEffect } from 'react';

export const CountDown: React.FC = () => {
  const [count, setCount] = useState(3); // Start countdown from 3

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <p className="text-6xl font-bold text-white bg-black/10 animate-ping">{count > 0 ? count : 'GO!'}</p>
    </div>
  );
};
