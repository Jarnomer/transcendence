import React, { useEffect, useState } from 'react';
import { useAnimatedNavigate } from '../../animatedNavigate';
import { getUserData, getUsersInQueue } from '../../services/userService';
import { NavIconButton } from '../UI/buttons/NavIconButton';

export const PlayerQueue: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersInQueue, setUsersInQueue] = useState<any[]>([]);
  const animatedNavigate = useAnimatedNavigate();

  async function fetchData() {
    setLoading(true);
    const fetchedQueueData = await getUsersInQueue();
    if (fetchedQueueData?.queues?.length) {
      const enrichedUsers = await Promise.all(
        fetchedQueueData.queues.map(async (userInQueue) => {
          const userDetails = await getUserData(userInQueue.user_id);
          return {
            ...userInQueue,
            display_name: userDetails?.display_name || 'Unknown',
            avatar_url: userDetails?.avatar_url || '',
          };
        })
      );
      setUsersInQueue(enrichedUsers);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoinGameClick = (event, opponent) => {
    event.stopPropagation();
    console.log('join game against: ', opponent);
  };

  return (
    <div>
      <ul>
        <h1 className="font-heading text-3xl ">Join Game</h1>

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
                onClick={() => animatedNavigate(`/profile/${user.user_id}`)}
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
                    onClick={(event) => handleJoinGameClick(event, user.user_id)}
                  />
                </div>
              </li>
            ))
        )}
      </ul>
    </div>
  );
};
