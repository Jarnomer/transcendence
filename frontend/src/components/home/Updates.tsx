import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { BackgroundGlow } from '../visual/BackgroundGlow';

interface DataInQueue {
  queue_id: string;
  isPrivate: boolean;
  mode: string;
  name: string;
  j;
  variant: string;
}

export const Updates: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [dataInQueue, setDataInQueue] = useState<DataInQueue[]>([]);
  const navigate = useNavigate();

  return (
    <>
      <motion.div className="w-full ">
        <div className="flex items-center justify-center text-center w-full h-[20px] bg-primary text-black text-xs">
          <h2 className="">News / Updates</h2>
        </div>
        <div className="flex gap-0  min-w-full">
          <div className="p-5 relative  w-full h-full relative overflow-hidden">
            <BackgroundGlow></BackgroundGlow>
            <div className="flex items-center justify-between ">
              <h2 className="font-heading text-2xl">3D Super Pong is online</h2>
              <p className="text-xs text-gray-400">15.4.2025</p>
            </div>
            <p className="text-secondary text-xs">Welcome to play 3D Super Pong</p>
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl">asdasd</h2>
              <p className="text-xs text-gray-400">1.4.2025</p>
            </div>
            <p className="text-secondary text-xs">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eget elementum nulla.
              Praesent in felis sem. Quisque nec lacus scelerisque, iaculis magna sit amet,
              tincidunt libero. Nunc sagittis laoreet metus, eu aliquam mauris. Sed in metus sed
              erat dapibus bibendum. Aliquam pellentesque, erat ut tincidunt eleifend, lacus felis
              tempor tortor, quis gravida enim leo eget felis. Vestibulum at vulputate sapien, in..
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};
