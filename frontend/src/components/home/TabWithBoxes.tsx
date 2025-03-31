import React from 'react';

import { motion } from 'framer-motion';

import { BoxDiv } from '../visual/svg/containers/SvgBoxContainer';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

export const TabWithBoxes: React.FC = () => {
  return (
    <div>
      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap gap-2 justify-center"
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <li key={index} className="w-[200px] h-[200px]">
            <BoxDiv index={index} />
          </li>
        ))}
      </motion.ul>
    </div>
  );
};
