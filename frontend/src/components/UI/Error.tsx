import React, { ReactNode } from 'react';

import { motion } from 'framer-motion';

import { WarningSign } from '@components/visual';

interface ErrorProps {
  children: ReactNode;
}

export const Error: React.FC<ErrorProps> = ({ children }) => {
  return (
    <motion.div className="p-4flex relative backdrop-blur-sm">
      <div className="absolute right-0 top-0">
        <WarningSign />
      </div>
      <div>
        <h1 className="text-5xl font-extrabold">ERROR</h1>
        {children}
      </div>
    </motion.div>
  );
};
