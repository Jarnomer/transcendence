import React from 'react';

import { motion } from 'framer-motion';

export const BracketLine: React.FC = () => {
  return (
    <motion.div className="w[500px] h-[500px]">
      <motion.svg
        className="w-full"
        viewBox="0 0 241 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d="M163.763 0.910156H98.8058L82.1783 17.5377H5.18327"
          stroke="currentColor"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.2, ease: 'easeInOut' }}
        />
        <motion.path
          d="M5.18327 17.5377C4.93577 16.6152 4.08079 15.9177 3.06829 15.9177C1.85329 15.9177 0.863281 16.9077 0.863281 18.1452C0.863281 19.3602 1.85329 20.3502 3.06829 20.3502C4.08079 20.3502 4.93577 19.6527 5.18327 18.7302H82.6508"
          stroke="currentColor"
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 0.2, ease: 'easeInOut' }}
        />
        <motion.path
          d="M157.283 4.35254L152.828 7.43503H237.743L240.826 4.35254H157.283Z"
          stroke="currentColor"
          strokeWidth={1}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.9, duration: 0.2, ease: 'easeInOut' }}
        />
        <motion.path
          d="M157.283 4.35254L152.828 7.43503H237.743L240.826 4.35254H157.283Z"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.2, ease: 'easeInOut' }}
        />
        <motion.path
          d="M197.266 9.86435H235.628L237.361 8.15436L199.021 8.13184L197.266 9.86435Z"
          stroke="currentColor"
          strokeWidth={1}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 1.1, duration: 0.2, ease: 'easeInOut' }}
        />
      </motion.svg>
    </motion.div>
  );
};
