import React, { useState } from 'react';

import { useChatContext } from '../../contexts/chatContext/ChatContext';

type CreateRoomPopupProps = {
  isVisible: boolean;
  onClose: () => void;
  friends: any[];
  onRoomCreated: (roomId: string) => void;
};

export const CreateRoomPopup: React.FC<CreateRoomPopupProps> = ({
  isVisible,
  onClose,
  friends,
  onRoomCreated,
}) => {
  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { createRoom } = useChatContext();

  const handleRoomCreation = () => {
    console.log(roomName.trim());
    if (roomName.trim() === '') return;

    createRoom(roomName, isPrivate, selectedMembers);
    onClose(); // Close the popup after room creation
  };

  const handleToggleMember = (friendId: string) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(friendId)
        ? prevSelected.filter((id) => id !== friendId)
        : [...prevSelected, friendId]
    );
  };

  return (
    <>
      {isVisible && (
        <div className="glass-box bg-opacity-50 flex justify-center items-center z-50">
          <div className=" p-4 rounded-lg w-96">
            <h2>Create a Room</h2>
            <input
              type="text"
              placeholder="Room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full p-2 mt-2 border rounded"
            />
            <div className="flex items-center mt-4">
              <label htmlFor="private-toggle" className="mr-2">
                Private Room?
              </label>
              <input
                id="private-toggle"
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
            </div>
            <div className="mt-4">
              <h3>Select Members</h3>
              {friends.map((friend) => (
                <div key={`create_room_${friend.user_id}`} className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(friend.user_id)}
                    onChange={() => handleToggleMember(friend.user_id)}
                    className="mr-2"
                  />
                  <span>{friend.display_name}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <button onClick={onClose} className="px-4 py-2 ">
                Cancel
              </button>
              <button onClick={handleRoomCreation} className="px-4 py-2 ">
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
