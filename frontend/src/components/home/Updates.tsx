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
      <motion.div className="w-full h-[100px]">
        <div className="flex items-center justify-center text-center w-full h-[20px] bg-primary text-black text-xs">
          <h2 className="">News / Updates</h2>
        </div>
        <div className="flex gap-0  min-w-full h-[100px]">
          <div className="p-5 relative  w-full h-full relative overflow-hidden">
            <BackgroundGlow></BackgroundGlow>
            <p className="text-secondary text-xs">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam eget elementum nulla.
              Praesent in felis sem. Quisque nec lacus scelerisque, iaculis magna sit amet,
              tincidunt libero. Nunc sagittis laoreet metus, eu aliquam mauris. Sed in metus sed
              erat dapibus bibendum. Aliquam pellentesque, erat ut tincidunt eleifend, lacus felis
              tempor tortor, quis gravida enim leo eget felis. Vestibulum at vulputate sapien, in
              fermentum justo. Mauris porta ante vitae augue elementum, ac luctus ligula vehicula.
              Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos
              himenaeos. Duis sed neque condimentum, luctus mi id, faucibus elit. Morbi sodales in
              libero sed pretium. Nullam in diam consectetur, ornare felis eu, tincidunt urna. Morbi
              venenatis felis quis leo efficitur, vitae dignissim massa mollis. Sed ut arcu eu ante
              interdum congue eget id est. Mauris velit lectus, bibendum sed eros ut, elementum
              aliquam orci.
            </p>
          </div>
        </div>
      </motion.div>
    </>
  );
};
