import React, { useCallback, useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { useUser } from '@contexts';

import { ClippedButton, ProfilePictureSmall } from '@components/UI';

import { getBlockedUsers, unblockUser } from '@services';

import { BlockedUserArrayType } from '@shared/types';

// const animationVariants = {
//   initial: {
//     clipPath: 'inset(0 0 100% 0)',
//     opacity: 0,
//   },
//   animate: {
//     clipPath: 'inset(0 0% 0 0)',
//     opacity: 1,
//     transition: { duration: 0.4, ease: 'easeInOut', delay: 0.5 },
//   },
//   exit: {
//     clipPath: 'inset(0 100% 0 0)',
//     opacity: 0,
//     transition: { duration: 0.4, ease: 'easeInOut' },
//   },
// };

export const UserSettings: React.FC = () => {
  const { userId } = useUser();
  const [myBlockedUsers, setMyBlockedUsers] = useState<BlockedUserArrayType>([]);
  // const navigate = useNavigate();

  const handleSaveSettings = () => {
    console.log('---- Saving User settings -------');
  };

  const fetchBlockedUsers = useCallback(() => {
    if (!userId) return;
    getBlockedUsers()
      .then((data) => {
        setMyBlockedUsers(data);
      })
      .catch((err) => console.error('Failed to fetch blocked users:', err));
  }, [userId]);

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblockUser = async (block_user_id: string) => {
    console.log('unblocking user :', block_user_id);
    await unblockUser(block_user_id);
    fetchBlockedUsers();
  };

  return (
    <motion.div className="h-full w-full relative flex flex-col pb-5 text-xs">
      <div className="w-full h-full overflow-y-scroll p-10">
        <h2 className="font-heading text-2xl">Blocked Users</h2>
        <motion.ul className="pl-5 w-full gap-3 overflow-y-scroll">
          {myBlockedUsers.map((user) => (
            <motion.li className="flex gap-2 w-full" key={user.user_id}>
              <ProfilePictureSmall user={user} avatarUrl={user.avatar_url} />
              <p className=" text-sm">{user.display_name}</p>
              <button
                onClick={() => handleUnblockUser(user.user_id)}
                className="text-xs text-gray-400 hover:text-secondary"
              >
                Remove block
              </button>
            </motion.li>
          ))}
        </motion.ul>
        <h2 className="font-heading text-2xl">Delete Account</h2>
      </div>

      <div className="flex w-full grow-1  justify-end items-end pr-2 pb-2">
        <ClippedButton label={'Save'} onClick={() => handleSaveSettings()} />
      </div>
    </motion.div>
  );
};
