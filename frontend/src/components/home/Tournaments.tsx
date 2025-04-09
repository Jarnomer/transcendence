import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useGameOptionsContext } from '../../contexts/gameContext/GameOptionsContext';
import { getUsersInQueue } from '../../services/userService';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { BackgroundGlow } from '../visual/BackgroundGlow';

interface UsersInQueue {
  display_name: string;
  avatar_url: string;
  user_id: string;
  queue_id: string;
  mode: string;
  variant: string;
}

export const Tournaments: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersInQueue, setUsersInQueue] = useState<UsersInQueue[]>([]);
  const navigate = useNavigate();
  const { setMode, setDifficulty, setLobby, setQueueId } = useGameOptionsContext();

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
          mode: queue.mode,
          variant: queue.variant,
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

  const handleJoinGameClick = (event, user: UsersInQueue) => {
    event.stopPropagation();
    console.log('join game against: ', user);
    setMode(user.mode);
    setDifficulty(user.variant);
    setLobby('join');
    setQueueId(user.queue_id);
    navigate('/game');
  };

  return (
    <>
      <div className="glass-box p-5 w-full relative overflow-hidden">
        <BackgroundGlow></BackgroundGlow>
        <ul>
          <h1 className="font-heading text-3xl w-full">Players looking for an opponent</h1>

          {usersInQueue.filter((user) => user.user_id != localStorage.getItem('userID')).length ===
          0 ? (
            <li className="text-muted text-gray-500 text-sm">No players in queue</li>
          ) : (
            usersInQueue
              .filter((user) => user.user_id != localStorage.getItem('userID'))
              .map((user, index) => (
                <li
                  key={index}
                  className="my-2"
                  onClick={() => navigate(`/profile/${user.user_id}`)}
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-full relative h-[50px] w-[50px] border-2 border-primary overflow-hidden">
                      <img
                        className="object-cover rounded-full w-full h-full"
                        src={user.avatar_url}
                      />
                    </div>
                    <p>{user.display_name || 'N/A'}</p>
                    <p className="text-gray-500 text-sm">rank: ??</p>
                    <NavIconButton
                      id="join-game-button"
                      icon="arrowRight"
                      onClick={(event) => handleJoinGameClick(event, user)}
                    />
                  </div>
                </li>
              ))
          )}
        </ul>
      </div>
    </>
  );
};
