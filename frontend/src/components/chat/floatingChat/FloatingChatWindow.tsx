import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { UserDataResponseType } from '../../../../../shared/types';
import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useUser } from '../../../contexts/user/UserContext';
import { useSound } from '../../../hooks/useSound';
import { NavIconButton } from '../../UI/buttons/NavIconButton';
import { MessageInput } from '../MessageInput';
import { MessageList } from '../MessageList';

interface ChatWindowProps {
  friends: UserDataResponseType[];
  selectedFriendId: string | null;
  roomId: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
}

export const FloatingChatWindow: React.FC<ChatWindowProps> = ({
  friends,
  selectedFriendId,
  roomId,
  onBack,
  onSend,
}) => {
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const { messages } = useChatContext();
  const navigate = useNavigate();
  const { user } = useUser();
  const playUnSelectSound = useSound('/sounds/effects/unselect.wav');
  const playSelectSound = useSound('/sounds/effects/select.wav');

  const playZoomSound = useSound('/sounds/effects/zoom.wav');

  const handleChatMinimize = () => {
    if (!minimized) playUnSelectSound();
    else playSelectSound();
    setMinimized(!minimized);
  };

  console.log(roomId);
  return (
    <div
      className={` w-[300px] glass-box  text-primary backdrop-blur-sm ${
        minimized ? 'h-12' : ' h-[400px]'
      } glass-box overflow-hidden`}
    >
      <div className="h-full w-full flex flex-col flex-1">
        <div className=" border-b flex justify-between items-center ">
          <div
            className="w-full bg-primary text-black p-2 flex justify-between items-center cursor-pointer"
            onClick={minimized ? handleChatMinimize : undefined}
          >
            {selectedFriendId ? (
              <span onClick={() => navigate(`/profile/${selectedFriendId}`)}>
                {friends.find((f) => f.user_id === selectedFriendId)?.display_name}
              </span>
            ) : (
              roomId
            )}
            <div className="flex items-center gap-2">
              {!minimized && (
                <button onClick={handleChatMinimize} className="text-xs">
                  {'▼'}
                </button>
              )}
              <NavIconButton
                icon="close"
                onClick={() => {
                  playUnSelectSound();
                  onBack();
                }}
                id="chat-back-button"
                ariaLabel="back to conversations"
              ></NavIconButton>
            </div>
          </div>
          <div />
        </div>

        {!minimized && (
          <>
            <MessageList
              messages={messages}
              user={user}
              selectedFriendId={selectedFriendId}
              roomId={roomId}
            />
            <div className="p-2 border-t flex gap-2">
              <MessageInput selectedFriendId={selectedFriendId} roomId={roomId}></MessageInput>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// interface ChatWindowProps {
//   friends: UserDataResponseType[];
//   selectedFriendId: string | null;
//   roomId: string | null;
//   onBack: () => void;
//   onSend: (text: string) => void;
// }

// export const FloatingChatWindow: React.FC<ChatWindowProps> = ({
//   messages,
//   user,
//   friends,
//   selectedFriendId,
//   onBack,
// }) => {
//   return (
//     <div className="h-[400px] w-[300px] glass-box  transition-all duration-300 text-primary">
//       <ChatWindow
//         friends={friends}
//         selectedFriendId={selectedFriend}
//         onBack={() => {
//           setSelectedFriend(null);
//           setRoomId(null);
//         }}
//         onSend={sendChatMessage}
//       />
//     </div>
//   );
// };
