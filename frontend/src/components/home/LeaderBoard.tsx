import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { getUsersWithRank } from '../../services/userService';
import SearchBar from '../UI/SearchBar';
import { BackgroundGlow } from '../visual/BackgroundGlow';

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut', delay: 0.5 },
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
  hidden: { opacity: 0, x: -10 }, // Start from the left
  visible: { opacity: 1, x: 0 }, // Move to the original position
  exit: { opacity: 0, x: -10 }, // Exit to the left
};

export const LeaderBoard: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const filteredUsers = users.filter((user) =>
    user.display_name?.toLowerCase().startsWith(searchQuery)
  );
  // .filter(
  //   (user) => !['easy', 'brutal', 'normal'].includes(user.user_id) // Filter by user_id
  // );

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const res = await getUsersWithRank();
    if (res) {
      console.log(res);
      setUsers(res);
    }
    setLoading(false);
  }

  return (
    <>
      <motion.div
        className="h-full min-h-[450px] relative glass-box p-10 overflow-hidden"
        variants={animationVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <BackgroundGlow></BackgroundGlow>
        <div className="absolute bottom-0 h-full  px-20 opacity-30 right-0 w-auto pointer-events-none">
          <img
            className="object-contain h-full mix-blend-overlay"
            src="./src/assets/images/king_of_the_hill.png"
          />
        </div>
        <h1 className="font-heading text-3xl">Leaderboard</h1>
        <div className="w-1/2">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search users..."
          />
        </div>
        {!loading ? (
          <div className="text-center">
            <motion.ul
              className="p-2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.4 }}
            >
              {filteredUsers.map((user, index) => (
                <motion.li
                  key={user.user_id}
                  className="my-2 "
                  onClick={() => navigate(`/profile/${user.user_id}`)}
                  variants={itemVariants}
                >
                  <div className="flex items-center gap-5">
                    <h2>{index + 1}</h2>
                    <div className="opacity relative h-[50px] w-[50px] border-2 border-primary overflow-hidden">
                      <img
                        className="object-cover w-full h-full"
                        src={user.avatar_url}
                        alt={user.display_name}
                      />
                    </div>
                    <p>
                      {user.display_name || 'N/A'} <br />
                    </p>
                    <p>Rank: {user.rank}</p>
                  </div>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        ) : null}
      </motion.div>
    </>
  );
};
