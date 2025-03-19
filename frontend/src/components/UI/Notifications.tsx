import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useUser } from '../../contexts/user/UserContext';

export const Notifications: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {}, []);

  if (!user || !user.friend_requests) {
    return <p>Loading...</p>;
  }

  const handleNotificationClick = (event, request: any) => {
    console.log('notification clicked');
    event.stopPropagation();
    navigate(`/profile/${request.user_id}`);
  };

  return (
    <>
      <ul>
        {user.friend_requests.length > 0 ? (
          user.friend_requests.map((request: any, index: number) => (
            <li key={index}>
              <div
                className="flex items-center justify-center gap-2"
                onClick={(event) => handleNotificationClick(event, request)}
              >
                <div className="h-[30px] w-[30px] rounded-full overflow-hidden border-primary border-1">
                  <img src={request.avatar_url} className="object-contain"></img>
                </div>
                <span className="text-xs">{request.display_name} sent you a friend request</span>
              </div>
            </li>
          ))
        ) : (
          <p>No friend requests.</p>
        )}
      </ul>
    </>
  );
};
