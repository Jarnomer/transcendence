import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { UserDataResponseType } from '@shared/types/userTypes';

import { useUser } from '../../contexts/user/UserContext';
import { api } from '../../services/api';
import { BackgroundGlow } from '../visual/BackgroundGlow';

interface EditProfileProps {
  user: UserDataResponseType;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
}

export const animationVariants = {
  initial: {
    clipPath: 'inset(0 100% 0 100% )',
    opacity: 0,
  },
  animate: {
    clipPath: 'inset(0 0% 0 0)',
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 }, // 👈 delay here
  },
  exit: {
    clipPath: 'inset(0 100% 0 100%)',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

export const EditProfile: React.FC<EditProfileProps> = ({ user, setEditProfile, setLoading }) => {
  const [formData, setFormData] = useState({
    display_name: user.display_name ? user.display_name : '',
    first_name: user.first_name ? user.first_name : '',
    last_name: user.last_name ? user.last_name : '',
    // email: '',
    bio: user.bio ? user.bio : '',
  });
  const { user: loggedInUser, refetchUser } = useUser();

  console.log(user);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!loggedInUser?.user_id) {
      console.error('User ID not found');
      return;
    }

    setLoading(true);
    try {
      const res = await api.patch(`user/${loggedInUser.user_id}`, formData);
      if (res.status != 200) {
        throw new Error('Failed to update profile');
      }
      setEditProfile(false);
      console.log('edit profile set to false');
      refetchUser();
    } catch (error) {
      console.error('Failed to update profile', error);
    }
    setLoading(false);
  };
  return (
    <>
      <motion.div
        className="relative overflow-hidden  border-1 glass-box"
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <BackgroundGlow></BackgroundGlow>
        <div id="edit-profile-content" className="relative overflow-hidden border-primary">
          {user.display_name ? (
            <button
              className="absolute top-0 right-0 px-2 text-xl"
              onClick={() => setEditProfile(false)}
            >
              x
            </button>
          ) : null}
          <h3 className="text-lg font-bold">Edit Profile</h3>
          <div className="">
            <div className="flex p-2 gap-2 text-left text-xs">
              <div className="border-1 w-2/3">
                <p className="px-1 text-xs text-gray-500">user id</p>
                <p className="px-2 text-gray-500">{user.user_id?.slice(0, 20)}</p>
              </div>
              <div className="border-1 w-1/3">
                <p className="px-1 text-xs text-gray-500">Username</p>
                <p className="px-2 text-gray-500">{user.username}</p>
              </div>
            </div>
            <form className="flex flex-col" onSubmit={handleSubmit}>
              {/* <div className="h-[100px] onject-contain  border-1">
                <img className="h-full object-contain" src={user?.avatar_url}></img>
              </div> */}
              <span className="flex flex-row relative">
                <div className="border relative">
                  <span className="text-xs absolute top-1 left-1">Display Name</span>
                  <input
                    type="text"
                    name="display_name"
                    placeholder={user.display_name ? user.display_name : 'Missing data'}
                    value={formData.display_name}
                    onChange={handleInputChange}
                    className="pt-5 px-2"
                  />
                </div>
                <div className="border relative">
                  <span className="text-xs absolute top-1 left-1">Email</span>
                  {/* <input
                    type="text"
                    name="email"
                    placeholder="Missing Data"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pt-5 px-2"
                  /> */}
                </div>
              </span>
              <span className="flex flex-row relative">
                <div className="border relative">
                  <span className="text-xs absolute top-1 left-1">First Name</span>
                  <input
                    type="text"
                    name="first_name"
                    placeholder={user.first_name ? user.first_name : 'Missing data'}
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="pt-5 px-2"
                  />
                </div>
                <div className="border relative">
                  <span className="text-xs absolute top-1 left-1">Last Name</span>
                  <input
                    type="text"
                    name="last_name"
                    placeholder={user.last_name ? user.last_name : 'Missing data'}
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="pt-5 px-2"
                  />
                </div>
              </span>
              <div className="border flex flex-row w-full relative">
                <span className="text-xs absolute top-1 left-1">Biography</span>
                <input
                  type="text"
                  name="bio"
                  placeholder=""
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="pt-5 px-2 border w-full"
                />
              </div>
              <button
                type={'submit'}
                className="m-2 w-1/2 text-primary border-2 border-primary px-4 py-2"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </>
  );
};
