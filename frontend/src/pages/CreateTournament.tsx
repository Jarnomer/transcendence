import React from 'react';

import { motion } from 'framer-motion';

import { SvgBorderBig } from '../components/visual/svg/borders/SvgBorderBig';

export const CreateTournament: React.FC = () => {
  return (
    <>
      <motion.div className="h-full min-h-[450px] relative glass-box mt-10 text-sm">
        <span className="absolute top-0 left-0 translate-y-[-50%] w-full mb-2">
          <SvgBorderBig></SvgBorderBig>
        </span>
        <div className="w-full h-full p-5">
          <h1 className="font-heading text-4xl">Create Tournament</h1>
          <p>player count: </p>
          <p>etc: </p>
        </div>
      </motion.div>
    </>
  );
};
