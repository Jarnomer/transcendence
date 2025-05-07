import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

const avatarList = [
  './src/assets/images/ai_easy.png',
  './src/assets/images/ai_hard.png',
  './src/assets/images/ai.png',
  './src/assets/images/ai_3.png',
];

export const ChangingAvatar: React.FC = () => {
  const [opponentAvatar, setOpponentAvatar] = useState<string>(avatarList[0]);
  useEffect(() => {
    const interval: NodeJS.Timeout = setInterval(() => {
      setOpponentAvatar((prev) => {
        let newAvatar;
        do {
          newAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];
        } while (newAvatar === prev);
        console.log('changing avatar');
        return newAvatar;
      });
    }, 300);
    return () => {
      console.log('clearing interval');
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-[200px] h-auto max-w-full aspect-square  bg-background overflow-hidden border-2 border-primary relative">
      <div className="absolute w-full h-full">
        <AnimatePresence mode="wait">
          {opponentAvatar && (
            <motion.img
              key={opponentAvatar}
              src={opponentAvatar}
              alt="Opponent"
              initial={{ y: -200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={`w-full h-full object-cover absolute`}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
