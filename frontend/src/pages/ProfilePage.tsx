import React, { useState, useEffect, useRef } from 'react';
import { api, getUserData } from '../services/api.ts';
import { useParams } from 'react-router-dom';
import { NavIconButton } from '../components/NavIconButton.tsx';
import { SVGModal } from '../components/wrappers/svgModal.tsx';

import { Vibrant } from 'node-vibrant/browser';
import { BackgroundGlow } from '../components/BackgroundGlow.tsx';
import { RadialBackground } from '../components/RadialBackground.tsx';

function timeAgo(lastActive: string): string {
  const now = new Date();
  const lastActiveDate = new Date(lastActive);
  const diffInMilliseconds = now.getTime() - lastActiveDate.getTime();

  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30); // Approximate month calculation
  const diffInYears = Math.floor(diffInDays / 365); // Approximate year calculation

  if (diffInYears > 0) {
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  }
  if (diffInMonths > 0) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
  }
  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  if (diffInHours > 0) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  if (diffInMinutes > 0) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  return `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} ago`;
}

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [editProfile, setEditProfile] = useState<boolean>(false);
  const [formData, setFormData] = useState({ display_name: '', first_name: '', last_name: '' });
  const [dominantColor, setDominantColor] = useState<string | null>(null);

  const { userId } = useParams<{ userId: string }>();
  const loggedInUserID = localStorage.getItem('userID');
  const isOwnProfile = userId === loggedInUserID;

  async function fetchData() {
    if (userId) {
      const fetchedUser = await getUserData(userId);
      console.log(fetchedUser);
      if (fetchedUser) {
        setUser(fetchedUser);
      }
    } else {
      console.error('User ID is undefined');
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchData();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user || !user.avatar_url) return;

    if (user.user_id === localStorage.getItem('userID') && !user.display_name) {
      setEditProfile(true);
    }
    // Fetch the dominant color of the avatar image when the user data is available
    const extractDominantColor = async () => {
      const imageUrl = `https://localhost:8443/${user.avatar_url}`;
      try {
        Vibrant.from(imageUrl)
          .getPalette()
          .then((palette) => {
            const vibrantColor = palette.Vibrant._rgb; // Get the RGB values for the Vibrant swatch
            const vibrantBgColor = `rgb(${vibrantColor[0]}, ${vibrantColor[1]}, ${vibrantColor[2]})`; // Convert to CSS format
            setDominantColor(vibrantBgColor); // Update the state with the vibrant background color
          });
      } catch (error) {
        console.error('Error extracting dominant color: ', error);
      }
    };
    extractDominantColor();
  }, [user]);

  // useEffect(() => {
  //   console.log("user from user useEffect: ", user);
  //   if (user.user_id === localStorage.getItem("userID") && !user.display_name)
  // }, [user]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const userID = localStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found');
      return;
    }
    const formData = new FormData();
    formData.append('avatar', file);

    setLoading(true);
    try {
      const res = await api.post(`user/avatar/${userID}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.status != 200) {
        throw new Error('Failed to upload avatar');
      }
      setUser(res.data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const userID = localStorage.getItem('userID');
    if (!userID) {
      console.error('User ID not found');
      return;
    }

    setLoading(true);
    console.log('form-data: ', formData);
    try {
      const res = await api.patch(`user/${userID}`, formData);
      if (res.status != 200) {
        throw new Error('Failed to update profile');
      }
      setUser(res.data);
      setEditProfile(false);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
    setLoading(false);
  };

  const handleAddFriendClick = (user_id: string) => {
    console.log('Sending friend request to user: ', user_id);
  };

  const handleChatClick = (user_id: string) => {
    console.log('Sending message to user: ', user_id);
  };

  const handleBlockUserClick = (user_id: string) => {
    console.log('Blocking user: ', user_id);
  };

  if (loading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user && !loading) {
    return <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>;
  }

  console.log('placing avatar: ', user.avatar_url);
  console.log(user);
  console.log('dominant color: ', dominantColor);

  return (
    <>
      <RadialBackground dominantColor={dominantColor}></RadialBackground>

      <div className="w-full h-full flex flex-col items-center p-6 text-center">
        {/* <div id="radial-bg" className="absolute inset-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_30%_20%,_theme(colors.primary)_5%,_rgba(0,0,0,0)_80%)]"></div> */}

        {/* Profile Header */}
        <div className="w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full relative w-[150px] h-[150px] border-2 border-primary">
              {/* Profile Picture */}
              <img
                className="object-cover rounded-full w-full h-full"
                src={`https://localhost:8443/${user.avatar_url}`}
              />

              {/* Upload Button */}
              {isOwnProfile && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  <button
                    className="absolute right-0 bottom-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg
                      className="size-9"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="black"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            <h2 className="text-xl font-semibold">{user.display_name}</h2>
            {/* <p className="text-gray-400">@{user.user_name}</p> */}

            {/* USER ONLINE / LAST ONLINE STATUS */}
            <div className="flex flex-col">
              <span
                className={`text-sm font-medium ${user.status == 'online' ? 'text-green-500' : 'text-gray-500'}`}
              >
                {user.status === 'online' ? 'Online' : 'Offline'}
              </span>
              {user.status === 'offline' ? (
                <span className="text-xs text-gray-500">
                  {' '}
                  Last active: {timeAgo(user.last_active)}
                </span>
              ) : null}
              <span></span>
            </div>

            {isOwnProfile ? (
              !editProfile ? (
                <button onClick={() => setEditProfile(true)}>Edit Profile</button>
              ) : null
            ) : (
              <div className="flex gap-2">
                <NavIconButton
                  id="add-friend"
                  icon="addFriend"
                  onClick={() => handleAddFriendClick(user.user_id)}
                />
                <NavIconButton
                  id="send-message"
                  icon="chat"
                  onClick={() => handleChatClick(user.user_id)}
                />
                <NavIconButton
                  id="block-user"
                  icon="block"
                  onClick={() => handleBlockUserClick(user.user_id)}
                />
              </div>
            )}
          </div>
        </div>

        {isOwnProfile ? (
          editProfile ? (
            <>
              <div className="relative overflow-hidden">
                <BackgroundGlow></BackgroundGlow>
                <div id="edit-profile-content" className="relative overflow-hidden glass-box p-10">
                  <h3 className="text-lg font-bold">Complete Your Profile</h3>
                  <p className="text-sm text-gray-500">Please provide your missing information.</p>
                  <div className="flex flex-col">
                    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                      <input
                        type="text"
                        name="display_name"
                        placeholder="Display Name *"
                        value={formData.display_name}
                        onChange={handleInputChange}
                        className=" p-2 border rounded mt-2"
                      />
                      <input
                        type="text"
                        name="first_name"
                        placeholder="First Name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className=" p-2 border rounded mt-2"
                      />
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Last Name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className=" p-2 border rounded mt-2"
                      />
                      <button
                        onClick={handleSubmit}
                        type={'submit'}
                        className="mt-4  text-primary border-2 border-primary px-4 py-2 rounded"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="w-full flex gap-4 flex-col md:flex-row items-center justify-center text-center">
              {/* Friends List */}
              <div className="w-full max-w-md mt-6 p-4 glass-box">
                <h3 className="text-lg font-semibold">Friends</h3>
                <div className="flex flex-col gap-2 mt-2">
                  {user.friends && user.friends.length > 0 ? (
                    user.friends.map((friend: any) => (
                      <div key={friend.user_id} className="flex items-center gap-3">
                        <img
                          src={friend.avatar_url}
                          alt={friend.display_name}
                          className="w-10 h-10 rounded-full"
                        />
                        <span className="text-md font-medium">{friend.display_name}</span>
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
                        <span
                          className={match.result === 'Win' ? 'text-green-500' : 'text-red-500'}
                        >
                          {match.result}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400">No match history</p>
                  )}
                </div>
              </div>
            </div>
          )
        ) : null}
      </div>
    </>
  );
};
