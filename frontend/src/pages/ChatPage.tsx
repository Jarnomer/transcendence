import React, { useState } from "react";

const dummyFriends = [
  { id: 1, username: "PlayerOne", online: true },
  { id: 2, username: "ShadowNinja", online: true },
  { id: 3, username: "RogueWarrior", online: false },
  { id: 4, username: "CyberGhost", online: true },
];

const dummyMessages = {
  1: [
    { sender: "PlayerOne", text: "Hey, wanna play?" },
    { sender: "You", text: "Yeah!" },
  ],
  2: [{ sender: "ShadowNinja", text: "Sup?" }],
};

export const ChatPage: React.FC = () => {
  const [selectedFriend, setSelectedFriend] = useState<number | null>(null);
  const [messages, setMessages] = useState(dummyMessages);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (selectedFriend !== null && newMessage.trim() !== "") {
      setMessages((prev) => ({
        ...prev,
        [selectedFriend]: [...(prev[selectedFriend] || []), { sender: "You", text: newMessage }],
      }));
      setNewMessage("");
    }
  };

  return (
    <div className="p-10">

    <div className="flex h-[500px] glass-box">
      {/* Friends List */}
      <div className="w-1/4 p-4 border-r ">
        <h2 className="text-xl font-bold mb-4">Online Friends</h2>
        <ul>
          {dummyFriends.map((friend) => (
            <li
              key={friend.id}
              className={`p-2 rounded cursor-pointer ${selectedFriend === friend.id ? "bg-gray-700" : "hover:bg-gray-800"} ${friend.online ? "text-primary" : "text-gray-500"}`}
              onClick={() => setSelectedFriend(friend.id)}
            >
              {friend.username} {friend.online ? "" : "(Offline)"}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="w-3/4 flex flex-col h-full ">
        {selectedFriend !== null ? (
          <>
            <div className="p-4  font-bold"> {dummyFriends.find(f => f.id === selectedFriend)?.username}</div>
            <div className="flex-1 p-4 overflow-y-auto">
              {messages[selectedFriend]?.map((msg, index) => (
                <div key={index} className={`mb-2 p-2 rounded ${msg.sender === "You" ? "border-primary border-1 ml-auto w-max" : "border-primary border-1 w-max"}`}>
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
              <button onClick={handleSendMessage} className="ml-2 bg-primary/25 px-4 py-2 rounded">Send</button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">Select a friend to chat</div>
        )}
      </div>
    </div>
    </div>
  );
};
