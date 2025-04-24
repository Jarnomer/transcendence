import React, { useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { UserDataResponseType } from '../../../../../shared/types';
import { useChatContext } from '../../../contexts/chatContext/ChatContext';
import { useUser } from '../../../contexts/user/UserContext';
import { useSound } from '../../../hooks/useSound';
import { NavIconButton } from '../../UI/buttons/NavIconButton';
import { MessageInput } from '../MessageInput';
import { MessageList } from '../MessageList';

interface ChatWindowProps {
  messages: any[];
  user: any;
  friends: UserDataResponseType[];
  selectedFriendId: string | null;
  roomId: string | null;
  onBack: () => void;
  onSend: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  friends,
  selectedFriendId,
  roomId,
  onBack,
}) => {
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const { messages } = useChatContext();
  // const chatMessages = messages[selectedFriendId] || [];
  const navigate = useNavigate();
  const { user } = useUser();

  const chatMessages = useMemo(() => {
    return messages[selectedFriendId] || [];
  }, [messages, selectedFriendId]);

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
    <div className={`p-0 w-full h-full max-h-fit text-primary backdrop-blur-sm overflow-hidden`}>
      <div className="p-0 h-full w-full flex flex-col flex-1">
        <div className="p-0 flex justify-between items-center ">
          <div className="w-full text-sm bg-primary text-black p-2 flex justify-between items-center cursor-pointer">
            {selectedFriendId ? (
              <span onClick={() => navigate(`/profile/${selectedFriendId}`)}>
                {friends.find((f) => f.user_id === selectedFriendId)?.display_name}
              </span>
            ) : (
              roomId
            )}
            <div className="flex items-center gap-2">
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

        <MessageList
          messages={chatMessages}
          user={user}
          selectedFriendId={selectedFriendId}
          roomId={roomId}
        />
        <div className="p-2 border-t flex gap-2">
          <MessageInput selectedFriendId={selectedFriendId} roomId={roomId}></MessageInput>
        </div>
      </div>
    </div>
  );
};
