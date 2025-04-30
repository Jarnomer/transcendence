import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { useSound } from '../../hooks/useSound';
import { getAmIBlockedBy } from '../../services/friendService';
import { getUsersWithRank } from '../../services/userService';
import { UserListCard } from '../UI/cards/UserListCard';
import { ProfilePictureMedium } from '../UI/ProfilePictureMedium';
import SearchBar from '../UI/SearchBar';

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { delay: 0.4, duration: 1.0, ease: 'easeInOut', delay: 0.5 },
  },
  exit: {
    clipPath: 'inset(0 100% 0 0)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.1, // Stagger items
      delay: 0.4,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
};

export const LeaderBoard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const playSelectPowerUpSound = useSound('/sounds/effects/select.wav');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredUsers = users.filter((user) =>
    user.display_name?.toLowerCase().startsWith(searchQuery)
  );

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await getUsersWithRank();
    if (res) {
      // console.log(res);
      setUsers(res);
    }
    setLoading(false);
  }

  const handleNavigate = async (user_id: string) => {
    const res = await getAmIBlockedBy(user_id);
    if (res) {
      console.log(res);
      return;
    }
    navigate(`/profile/${user_id}`);
  };

  return (
    <motion.div className="h-full overflow-hidden flex flex-col  items-center">
      <div className="flex w-full items-center justify-center text-center h-[20px] bg-primary text-black text-xs">
        Leaderboard
      </div>
      <motion.div
        className="relative overflow-hidden text-sm"
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <div className="w-full h-full relative overflow-hidden">
          <div className="py-1">
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search users..."
            />

            {!loading ? (
              <div className="text-center">
                <motion.ul
                  className="p-2 w-full h-full flex flex-col justify-items-start gap-2 "
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.4 }}
                >
                  {filteredUsers.map((user, index) => (
                    <motion.li
                      key={user.user_id}
                      className="h-[57px] min-w-[282px] flex gap-3 hover:scale-[1.05] hover:text-secondary"
                      onClick={() => {
                        playSelectPowerUpSound();
                        // Check if the user is blocked
                        handleNavigate(user.user_id);
                      }}
                      variants={itemVariants}
                    >
                      <div className="flex items-center justify-center text-center ml-2">
                        {index + 1}
                      </div>

                      {/* <ListSvgContainer></ListSvgContainer> */}
                      <UserListCard user={user}>
                        <div className="flex items-center gap-2">
                          <ProfilePictureMedium user={user}></ProfilePictureMedium>
                          <p className="text-xs">
                            {user.display_name || 'N/A'} <br />
                          </p>
                          <p>Rank: {user.rank}</p>
                        </div>
                      </UserListCard>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// <motion.div className="w-full">
//   <div className="flex items-center justify-center text-center w-full h-[20px] bg-primary text-black text-xs">
//     Leaderboard
//   </div>
//   <motion.div
//     className="h-full w-full text-xs relative  text-sm"
//     variants={animationVariants}
//     initial="hidden"
//     animate="visible"
//     exit="hidden"
//   >
//     <span className="absolute top-0 left-0 translate-y-[-50%] w-full" aria-hidden="true"></span>
//     <div className="w-full h-full relative overflow-hidden">
//       <BackgroundGlow></BackgroundGlow>
//       <div className="w-full h-full py-1">
//         {/* <div className="absolute bottom-0 h-full px-20 opacity-30 right-0 w-auto pointer-events-none">
//           <img
//             className="object-contain h-full mix-blend-overlay"
//             src="./src/assets/images/king_of_the_hill.png"
//             aria-hidden="true"
//             alt=""
//           />
//         </div> */}
//         {/* <h1 className="font-heading text-2xl sm:text-3xl text-center w-full">Leaderboard</h1> */}
//         <div className="w-full md:w-full flex items-center justify-center">
//           <SearchBar
//             value={searchQuery}
//             onChange={handleSearchChange}
//             placeholder="Search users..."
//           />
//         </div>
//         {!loading ? (
//           <div className="text-center">
//             <motion.ul
//               className="p-2 w-full h-full overflow-y-scroll"
//               variants={containerVariants}
//               initial="hidden"
//               animate="visible"
//               exit="hidden"
//               transition={{ duration: 0.4 }}
//             >
//               {filteredUsers.map((user, index) => (
//                 <motion.li
//                   key={user.user_id}
//                   className="my-2 border bg-primary/20 clipped-corner-bottom-right"
//                   onClick={() => navigate(`/profile/${user.user_id}`)}
//                   variants={itemVariants}
//                 >
//                   <div className="flex items-center gap-2">
//                     <span className="flex items-center justify-center text-center ml-2">
//                       {index + 1}
//                     </span>
//                     <div className="opacity relative h-[50px] w-[50px] border-1 border-primary overflow-hidden">
//                       <img
//                         className="object-cover w-full h-full"
//                         src={
//                           user.display_name.startsWith('AI')
//                             ? './src/assets/images/ai.png'
//                             : user.avatar_url
//                         }
//                         alt={`${user.display_name}'s profile picture`}
//                       />
//                     </div>
//                     <p className="text-xs">
//                       {user.display_name || 'N/A'} <br />
//                     </p>
//                     <p>Rank: {user.rank}</p>
//                   </div>
//                 </motion.li>
//               ))}
//             </motion.ul>
//           </div>
//         ) : null}
//       </div>
//     </div>
//   </motion.div>
// </motion.div>
