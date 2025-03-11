import React, { useState, useEffect } from 'react';
import { getUsers } from '../services/api';
import { useAnimatedNavigate } from '../animatedNavigate';
import { useNavigate } from 'react-router-dom';
import { NavIconButton } from '../components/NavIconButton';
import { sendFriendRequest } from '../services/api';

export const HomePage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const animatedNavigate = useAnimatedNavigate();
  const navigate = useNavigate();

  async function fetchData() {
    setLoading(true);
    const fetchedUsers = await getUsers();
    if (fetchedUsers) {
      setUsers(fetchedUsers);
      console.log(fetchedUsers);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, []);

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
      <div className="p-10">
        <h1 className="font-heading text-3xl border-primary">Users</h1>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {users
              .filter((user) => user.user_id != localStorage.getItem('userID'))
              .map((user, index) => (
                <li
                  key={index}
                  className="my-2"
                  onClick={() => animatedNavigate(`/profile/${user.user_id}`)}
                >
                  <div className="flex items-center gap-5">
                    <div className="rounded-full relative h-[50px] w-[50px] border-2 border-primary overflow-hidden">
                      <img
                        className="object-cover rounded-full w-full h-full"
                        src={user.avatar_url}
                      />
                    </div>
                    <p>
                      {user.display_name || 'N/A'} <br />
                    </p>
                    <span
                      className={`text-xs font-medium ${user.status === 'online' ? 'text-green-500' : 'text-gray-500'}`}
                    >
                      {user.status === 'online' ? 'Online' : 'Offline'}
                    </span>
                    <NavIconButton
                      id="add-friend"
                      icon="addFriend"
                      onClick={(event) => handleAddFriendClick(event, user.user_id)}
                    />
                    <></>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </>
  );
};
