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
      <motion.div className="w-full h-[100px]">
        <div className="flex items-center justify-center text-center w-full h-[20px] bg-primary text-black text-xs">
          <h2 className="">Open Tournaments</h2>
        </div>
        <div className="flex gap-0    min-w-full h-[100px]">
          <motion.div
            className="w-full h-full border-1 border-x-0 bg-primary/20 relative p-0 m-0  text-sm"
            // variants={animationVariants}
            // initial="hidden"
            // animate="visible"
            // exit="hidden"
          >
            {/* <div className="absolute top-0 left-0 translate-y-[-50%]">
              <svg
                width="56"
                height="7"
                viewBox="0 0 56 7"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M55.5 5.35075L51.1493 1H1V6.5"
                  stroke="currentColor"
                  fillOpacity={0.5}
                  fill="currentColor"
                />
              </svg>
            </div> */}

            {/* <div className="absolute bottom-0 right-0 w-full">
              <svg
                className="w-full"
                viewBox="0 0 337 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M336.5 1L326 11.5H1V1" stroke="currentColor" />
              </svg>
            </div> */}
            <div className="p-5 relative  w-full h-full relative overflow-hidden">
              <BackgroundGlow></BackgroundGlow>

              <p className="text-gray-500 text-xs">No on going Tournaments</p>
            </div>
          </motion.div>
          <div className="h-full m-0 p-0">
            <svg
              className="h-full p-0"
              viewBox="0 0 9 54"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 53H0V1H8V46L2 53Z" fill="currentColor" fillOpacity="0.2" />
              <path d="M0 53H2L8 46V1H0" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </motion.div>
    </>
  );
};
