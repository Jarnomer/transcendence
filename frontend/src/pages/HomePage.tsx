import React from 'react';

import { LeaderBoard } from '@components';

import { sendFriendRequest } from '@services/friendService';

import { PlayerQueue } from '../components/home/PlayersInQueue';

export const HomePage: React.FC = () => {
  const handleAddFriendClick = (event, receiver_id: string) => {
    // Stop the click event from bubbling up and triggering the navigate function
    event.stopPropagation();
    // Add your logic for adding a friend here
    console.log('Add friend clicked');
    sendFriendRequest(receiver_id).then(() => {
      console.log('Friend request sent');
    });
  };

  return (
    <>
      <div className="flex flex-grow w-full h-full justify-center gap-20">
        <div className="">
          <LeaderBoard></LeaderBoard>
        </div>
        <div className="">
          <PlayerQueue></PlayerQueue>
        </div>
      </div>
    </>
  );
};
