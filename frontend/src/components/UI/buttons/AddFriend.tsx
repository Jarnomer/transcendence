import React, { useEffect, useState } from 'react';

import { UserMinusIcon, UserPlusIcon } from '@heroicons/react/24/outline';

import { useUser } from '@/contexts/user/UserContext';

import { sendFriendRequest } from '../../../services/friendService';

interface AddFriendButtonProps {
  receiverUserId: string;
  onClick?: () => void;
}

const icons = {
  addFriend: <UserPlusIcon className="w-6 h-6" />,
  removeFriend: <UserMinusIcon className="w-6 h-6" />,
};

export const AddFriend: React.FC<AddFriendButtonProps> = ({ receiverUserId }) => {
  const { sentRequests, refetchRequests } = useUser();
  const [isPending, setIsPending] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sentRequests) {
      setIsPending(sentRequests.some((request) => request.receiver_id === receiverUserId));
    }
  }, [sentRequests, receiverUserId]);

  const handleAddFriendClick = async () => {
    if (!receiverUserId || loading) return;
    setLoading(true);
    if (isPending) {
      // HANDLE CANCELING FRIEND REQUEST HERE
      console.log('cancelling friend request');
    } else {
      try {
        await sendFriendRequest(receiverUserId);
        await refetchRequests();
        setIsPending(sentRequests.some((request) => request.receiver_id === receiverUserId));
      } catch (error) {
        console.error('Failed to send friend request:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button
      onClick={handleAddFriendClick}
      disabled={loading}
      aria-label={`${isPending ? 'delete friend' : 'add friend'}`}
    >
      {isPending ? icons.removeFriend : icons.addFriend}
    </button>
  );
};
