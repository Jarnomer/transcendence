import { NavIconButton } from '@components/UI/buttons/NavIconButton'; // Assuming this component is already in place
import React, { useState } from 'react';
import { useAnimatedNavigate } from '../../animatedNavigate';
import { acceptFriendRequest, rejectFriendRequest } from '../../services/friendService';

type Friend = {
  user_id: string;
  display_name: string;
  avatar_url: string;
};

type FriendListProps = {
  friends: Friend[];
  requests: Friend[];
};

export const FriendList: React.FC<FriendListProps> = ({ friends, requests }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const animatedNavigate = useAnimatedNavigate();

  const renderList = (list: Friend[], emptyText: string, isRequestList: boolean) => {
    return list && list.length > 0 ? (
      <ul>
        {list.map((friend) => (
          <li
            key={friend.user_id}
            onClick={() => animatedNavigate(`/profile/${friend.user_id}`)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <img
                className="w-10 h-10 rounded-full"
                src={`https://localhost:8443/${friend.avatar_url}`}
                alt={friend.display_name}
              />
              <span className="text-md font-medium">{friend.display_name}</span>
              {isRequestList && (
                <>
                  <NavIconButton
                    id={`accept-friend-${friend.user_id}`}
                    icon="checkCircle"
                    onClick={(event) => handleAcceptFriendClick(event, friend.user_id)}
                  />
                  <NavIconButton
                    id={`reject-friend-${friend.user_id}`}
                    icon="xCircle"
                    onClick={(event) => handleRejectFriendClick(event, friend.user_id)}
                  />
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-400">{emptyText}</p>
    );
  };

  const handleAcceptFriendClick = (event, sender_id: string) => {
    event.stopPropagation();
    acceptFriendRequest(sender_id)
      .then(() => {
        console.log('Friend request accepted');
      })
      .catch((error) => {
        console.error('Failed to accept friend request: ', error);
      });
  };

  const handleRejectFriendClick = (event, sender_id: string) => {
    event.stopPropagation();
    rejectFriendRequest(sender_id)
      .then(() => {
        console.log('Friend request rejected');
      })
      .catch((error) => {
        console.error('Failed to reject friend request: ', error);
      });
  };

  return (
    <div className="w-full max-w-md p-4 glass-box">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setActiveTab('friends')}
          className={`pb-2 font-semibold ${
            activeTab === 'friends' ? 'border-b-2 border-black' : 'text-gray-400'
          }`}
        >
          Friends
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-2 font-semibold ${
            activeTab === 'requests' ? 'border-b-2 border-black' : 'text-gray-400'
          }`}
        >
          Requests
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {activeTab === 'friends'
          ? renderList(friends, 'No friends yet', false)
          : renderList(requests, 'No requests yet', true)}
      </div>
    </div>
  );
};
