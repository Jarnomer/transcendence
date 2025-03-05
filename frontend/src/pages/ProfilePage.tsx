import React from "react";
import { api } from "../services/api.ts"

async function getUserData() {
  try {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      throw new Error("User ID not found");
    }
    const res = await api.get(`/user/${userID}`);
    if (res.status !== 200) {
      throw new Error(res.status);
    }
    console.log("res: ", res);
    return res.data;
  } catch (err) {
    console.error("Failed to get user data:", err);
    throw err;
  }
}


const dummyUser = {

  displayName: localStorage.getItem("username"),
  username: localStorage.getItem("username"),
  avatarURL: "./src/assets/images/default_pfp.png",
  onlineStatus: true,
  wins: 24,
  losses: 10,
  friends: [
    { id: 1, name: "PlayerOne", avatar: "https://via.placeholder.com/50" },
    { id: 2, name: "ShadowNinja", avatar: "https://via.placeholder.com/50" },
    { id: 3, name: "CyberKnight", avatar: "https://via.placeholder.com/50" },
  ],
  matchHistory: [
    { id: 1, opponent: "ShadowNinja", result: "Win" },
    { id: 2, opponent: "PlayerOne", result: "Loss" },
    { id: 3, opponent: "CyberKnight", result: "Win" },
  ],
};

export const ProfilePage: React.FC = () => {

  const user = getUserData();
  console.log(user)

  return (
    <div className="w-full h-full flex flex-col items-center p-6 text-center">
      {/* Profile Header */}
      <div className="w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full relative w-[150px] h-[150px] border-2 boder-primary">
            <img className="object-cover rounded-full" src={dummyUser.avatarURL} />

            <svg className="size-9 absolute right-0 bottom-0" xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>

          </div>
          <h2 className="text-xl font-semibold">{dummyUser.displayName}</h2>
          <p className="text-gray-400">@{dummyUser.username}</p>
          <span
            className={`text-sm font-medium ${dummyUser.onlineStatus ? "text-green-500" : "text-red-500"}`}
          >
            {dummyUser.onlineStatus ? "Online" : "Offline"}
          </span>
          <div className="flex gap-4 mt-4">
            <button >Edit Profile</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 flex gap-6 text-lg">
        <span className="font-semibold">Wins: {dummyUser.wins}</span>
        <span className="font-semibold">Losses: {dummyUser.losses}</span>
      </div>

      {/* Friends List */}
      <div className="w-full max-w-md mt-6 p-4 glass-box">
        <h3 className="text-lg font-semibold">Friends</h3>
        <div className="flex flex-col gap-2 mt-2">
          {dummyUser.friends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-400" />
              <span className="text-md font-medium">{friend.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Match History */}
      <div className="w-full max-w-md mt-6 p-4 glass-box">
        <h3 className="text-lg font-semibold">Match History</h3>
        <div className="flex flex-col gap-2 mt-2">
          {dummyUser.matchHistory.map((match) => (
            <div key={match.id} className="flex justify-between">
              <span>{match.opponent}</span>
              <span className={match.result === "Win" ? "text-green-500" : "text-red-500"}>{match.result}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
