import React from 'react';

import { useNavigate } from 'react-router-dom';

import { LeaderBoard } from '@components';

import { sendFriendRequest } from '@services/friendService';

import { PlayerQueue } from '../components/home/PlayersInQueue';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const handleAddFriendClick = (event, receiver_id: string) => {
    // Stop the click event from bubbling up and triggering the navigate function
    event.stopPropagation();
    // Add your logic for adding a friend here
    console.log('Add friend clicked');
    sendFriendRequest(receiver_id).then(() => {
      console.log('Friend request sent');
    });
  };

  const handleCreateGameClick = () => {
    // Add your logic for creating a game here
    console.log('Create game clicked');
    navigate('/gameMenu', { state: { lobby: 'create' } });
  };

  const handleJoinGameClick = () => {
    // Add your logic for joining a game here
    console.log('Join game clicked');
    navigate('/game', { state: { mode: '1v1', difficulty: 'online', lobby: 'join' } });
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
        <div className="">
          <button className="btn btn-primary" onClick={handleCreateGameClick}>
            create game
          </button>
        </div>
        <div className="">
          <button className="btn btn-primary" onClick={handleJoinGameClick}>
            quick join
          </button>
        </div>
      </div>
    </>
  );
};
