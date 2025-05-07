import React, { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

const avatarList = [
  '/images/avatars/ai_easy.png',
  '/images/avatars/ai_hard.png',
  '/images/avatars/ai.png',
  '/avatars/images/ai_3.png',
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
        return newAvatar;
      });
    }, 300);
    return () => {
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
