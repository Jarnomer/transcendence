import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { ProfilePictureMedium, SearchBar, UserListCard } from '@components/UI';

import { getAmIBlockedBy, getUsersWithRank } from '@services';

import { useSound } from '@hooks';

const animationVariants = {
  initial: {
    clipPath: 'inset(0 0 100% 0)',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { delay: 0.4, duration: 1.0, ease: 'easeInOut' },
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
    <motion.div
      className="flex flex-col items-center relative overflow-hidden text-sm"
      variants={animationVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <div className="flex w-full mb-1 items-center justify-center h-[20px] bg-primary text-black text-xs">
        Leaderboard
      </div>
      <SearchBar value={searchQuery} onChange={handleSearchChange} placeholder="Search users..." />

      {!loading ? (
        <motion.ul
          className="p-2 flex flex-col gap-2 "
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.4 }}
        >
          {filteredUsers.map((user) => (
            <motion.li
              key={user.user_id}
              className="h-[57px] min-w-[282px] flex gap-3 hover:scale-[1.05] hover:text-secondary"
              onClick={() => {
                playSelectPowerUpSound();
                handleNavigate(user.user_id);
                // navigate(`/profile/${user.user_id}`);
              }}
              variants={itemVariants}
            >
              <UserListCard user={user}>
                <div className="flex items-center gap-2">
                  <ProfilePictureMedium user={user}></ProfilePictureMedium>
                  <p className="text-xs text-secondary">{user.display_name || 'N/A'}</p>
                  <p className="text-xs text-secondary">Rank: {user.rank}</p>
                </div>
              </UserListCard>
            </motion.li>
          ))}
        </motion.ul>
      ) : null}
    </motion.div>
  );
};
