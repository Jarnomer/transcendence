import React, { useEffect, useState } from 'react';
import { useAnimatedNavigate } from '../../animatedNavigate';
import { getUsers } from '../../services/userService';
import SearchBar from '../UI/SearchBar';

export const LeaderBoard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const animatedNavigate = useAnimatedNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
    console.log('asd');
  };

  const filteredUsers = users.filter((user) =>
    user.display_name?.toLowerCase().startsWith(searchQuery)
  );

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await getUsers();
    if (res) {
      console.log(res);
      setUsers(res);
    }
    setLoading(false);
  }

  return (
    <>
      <div className="h-full">
        <h1 className="font-heading text-3xl">Leaderboard</h1>
        <div className="w-full">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users..."
          />
          {/* <p className="text-sm text-gray-500">turned off</p> */}
        </div>
        {!loading ? (
          <div className=" text-center">
            <ul className="p-2">
              {filteredUsers.map((user, index) => (
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
                    <p>Rank: ??</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
};

//   <h1 className="font-heading text-3xl border-primary">
//     Players waiting for an opponent
//   </h1>
//   {users
//     .filter((user) => user.user_id != localStorage.getItem('userID'))
//     .map((user, index) => (
//       <li
//         key={index}
//         className="my-2"
//         onClick={() => animatedNavigate(`/profile/${user.user_id}`)}
//       >
//         <div className="flex items-center gap-5">
//           <div className="rounded-full relative h-[50px] w-[50px] border-2 border-primary overflow-hidden">
//             <img
//               className="object-cover rounded-full w-full h-full"
//               src={user.avatar_url}
//             />
//           </div>
//           <p>
//             {user.display_name || 'N/A'} <br />
//           </p>
//           <></>
//         </div>
//       </li>
//     ))}
// </ul>
