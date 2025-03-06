import React, { useState, useEffect, useRef } from "react";
import { api, getUserData } from "../services/api.ts";




export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);


  async function fetchData() {
    const fetchedUser = await getUserData();
    console.log(fetchedUser);
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const userID = localStorage.getItem("userID");
    if (!userID) {
      console.error("User ID not found");
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    console.log("uploading avatar")
    setLoading(true);
    try {
      const res = await api.post(`user/avatar/${userID}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status != 200) {
        throw new Error("Failed to upload avatar");
      }

      setUser(res.data);
      // FETCH THE UPDATED USERDATA AFTER AVATAR UPLOAD
      //await fetchData();

    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };




  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>;
  }

  console.log("user avatar url: ", user.avatar_url)
  return (
    <div className="w-full h-full flex flex-col items-center p-6 text-center">
      {/* Profile Header */}
      <div className="w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full relative w-[150px] h-[150px] border-2 border-primary">
            {/* Profile Picture */}
            <img className="object-cover rounded-full w-full h-full" src={user.avatar_url} />

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* Upload Button */}
            <button
              className="absolute right-0 bottom-0  rounded-full "
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="size-9" xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </button>
          </div>
          <h2 className="text-xl font-semibold">{user.displayName}</h2>
          <p className="text-gray-400">@{localStorage.getItem("username")}</p>
          <span className={`text-sm font-medium ${user.status ? "text-green-500" : "text-red-500"}`}>
            {user.status ? "Online" : "Offline"}
          </span>
          <div className="flex gap-4 mt-4">
            <button>Edit Profile</button>
          </div>
        </div>
      </div>

      <div className="w-full flex gap-4 flex-col md:flex-row items-center justify-center text-center">
        {/* Friends List */}
        <div className="w-full max-w-md mt-6 p-4 glass-box">
          <h3 className="text-lg font-semibold">Friends</h3>
          <div className="flex flex-col gap-2 mt-2">
            {user.friends && user.friends.length > 0 ? (
              user.friends.map((friend: any) => (
                <div key={friend.id} className="flex items-center gap-3">
                  <img src={friend.avatar} alt={friend.name} className="w-10 h-10 rounded-full" />
                  <span className="text-md font-medium">{friend.name}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No friends yet</p>
            )}
          </div>
        </div>

        {/* Match History */}
        <div className="w-full min-h-full max-w-md p-4 glass-box">
          <h3 className="text-lg font-semibold">Match History</h3>
          {/* Stats */}
          <div className="w-full text-center flex items-center justify-center gap-6 text-lg">
            <span className="font-semibold">Wins: {user.wins || 0}</span>
            <span className="font-semibold">Losses: {user.losses || 0}</span>
          </div>
          <div className="flex min-h-full flex-col gap-2 mt-2">
            {user.matchHistory && user.matchHistory.length > 0 ? (
              user.matchHistory.map((match: any) => (
                <div key={match.id} className="flex justify-between">
                  <span>{match.opponent}</span>
                  <span className={match.result === "Win" ? "text-green-500" : "text-red-500"}>{match.result}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No match history</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
