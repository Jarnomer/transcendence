import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

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
      <div className="glass-box p-5 w-full relative overflow-hidden">
        <BackgroundGlow></BackgroundGlow>
        <h2 className="font-heading text-3xl">Open Tournaments</h2>
        <p className="text-gray-500 text-sm">No on going Tournaments</p>
      </div>
    </>
  );
};
