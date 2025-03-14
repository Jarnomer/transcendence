import React, { useEffect, useState } from 'react';
import { useWebSocketContext } from '../../services';
import { getUserData } from '../../services/userService';

interface MatchMakingCarouselProps {}

export const MatchMakingCarousel: React.FC<MatchMakingCarouselProps> = ({}) => {
  const [animate, setAnimate] = useState<boolean>(true);
  const { gameStatus, connectionStatus } = useWebSocketContext();
  const [user, setUser] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    setLoading(true);
    getUserData(userId)
      .then((data) => {
        console.log('User dataaaa: ', user);
        setUser(data);
      })
      .catch((error) => {
        console.error('Failed to fetch user data: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // useEffect(() => {}, [connectionStatus]);

  return (
    <div className="flex w-full h-full">
      <div>
        <img src={user.avatar_url}></img>
      </div>

      <div></div>
    </div>
  );
};
