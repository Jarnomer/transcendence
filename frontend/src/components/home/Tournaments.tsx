import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { getUsersInQueue } from '../../services/userService';
import { BackgroundGlow } from '../visual/BackgroundGlow';

export const Tournaments: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersInQueue, setUsersInQueue] = useState<any[]>([]);
  const navigate = useNavigate();

  async function fetchData() {
    setLoading(true);
    const fetchedQueueData = await getUsersInQueue();
    console.log(fetchedQueueData);
    if (fetchedQueueData.queues) {
      console.log('fetched:', fetchedQueueData);
      const enrichedUsers = fetchedQueueData.queues.flatMap((queue) =>
        queue.players.map((player) => ({
          display_name: player.display_name || 'Unknown',
          avatar_url: player.avatar_url || '',
          user_id: player.user_id,
          queue_id: queue.queue_id,
        }))
      );
      console.log('enriched:', enrichedUsers);
      setUsersInQueue(enrichedUsers);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    console.log('users in queue:', usersInQueue);
  }, [usersInQueue]);

  const handleJoinGameClick = (event, user) => {
    event.stopPropagation();
    console.log('join game against: ', user);
    navigate('/game', {
      state: { mode: '1v1', difficulty: 'online', lobby: 'join', queueId: user.queue_id },
    });
  };

  return (
    <>
      <motion.div className="w-full">
        <div className="flex items-center justify-center text-center w-full h-[20px] bg-primary text-black text-xs">
          <h2 className="">Open Tournaments</h2>
        </div>
        <motion.div
          className=" w-full text-xs relative  text-sm"
          // variants={animationVariants}
          // initial="hidden"
          // animate="visible"
          // exit="hidden"
        >
          <div className="p-5 mt-1 border-1 w-full h-full relative overflow-hidden bg-primary/20 clipped-corner-bottom-right">
            <BackgroundGlow></BackgroundGlow>

            <p className="text-gray-500 text-xs">No on going Tournaments</p>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
