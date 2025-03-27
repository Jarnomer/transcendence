import React, { useEffect, useState } from 'react';

import { BackgroundGlow } from '../components';
import SearchBar from '../components/UI/SearchBar';
import { getUserData } from '../services/userService';

export const ChatPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messages, setMessages] = useState();
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
    console.log('asd');
  };

  const filteredUsers = friends.filter((user) =>
    user.display_name.toLowerCase().startsWith(searchQuery)
  );

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    if (!userId) return;
    setLoading(true);
    getUserData(userId)
      .then((data) => {
        console.log('User dataaaa: ', data);
        setUser(data);
        setFriends(data.friends);
      })
      .catch((error) => {
        console.error('Failed to fetch user data: ', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSendMessage = () => {
    if (selectedFriend !== null && newMessage.trim() !== '') {
      setMessages((prev) => ({
        ...prev,
        [selectedFriend]: [...(prev[selectedFriend] || []), { sender: 'You', text: newMessage }],
      }));
      setNewMessage('');
    }
  };

  return (
    <div className="p-10 w-[80%]">
      {/* <AnimatePresence> */}
      {/* just testing here */}
      {/* <BracketLine></BracketLine> */}
      {/* </AnimatePresence> */}
      <div className="flex relative h-[600px] glass-box overflow-hidden">
        <BackgroundGlow />
        {/* Friends List */}
        <div className="w-1/4 p-4 border-r ">
          <button
            onClick={() => {
              console.log('clicked');
            }}
          >
            Click me
          </button>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users..."
          />
          <h2 className="text-xl font-bold mb-4">Friends</h2>
          <ul>
            {friends.map((friend) => (
              <li
                key={friend.user_id}
                className={`p-2 rounded cursor-pointer ${selectedFriend === friend.user_id ? 'bg-gray-700' : 'hover:bg-gray-800'} ${friend.status === 'online' ? 'text-primary' : 'text-gray-500'}`}
                onClick={() => setSelectedFriend(friend.user_id)}
              >
                {friend.display_name} {friend.status === 'online' ? '' : '(Offline)'}
              </li>
            ))}
          </ul>
        </div>

        {/* Chat Window */}
        <div className="w-full flex flex-col h-full ">
          {selectedFriend !== null ? (
            <>
              <div className="p-4  font-bold">
                {' '}
                {friends.find((f) => f.user_id === selectedFriend)?.username}
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {messages[selectedFriend]?.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded ${msg.sender === 'You' ? 'border-primary border-1 ml-auto w-max' : 'border-primary border-1 w-max'}`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>
              {/* Message Input */}
              <div className="p-4 border-t border-primary flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 bg-gray-800 border-2 border-primary bg-black/5 rounded focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="ml-2 bg-primary/25 px-4 py-2 rounded"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a friend to chat
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
