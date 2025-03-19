import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { useUser } from '../../contexts/user/UserContext';
import { api } from '../../services/api';
import { BackgroundGlow } from '../visual/BackgroundGlow';

interface EditProfileProps {
  user: any[];
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
  const [formData, setFormData] = useState({ display_name: '', first_name: '', last_name: '' });
  const { user: loggedInUser, refetchUser } = useUser();

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
        className="relative overflow-hidden"
        variants={animationVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <BackgroundGlow></BackgroundGlow>
        <div id="edit-profile-content" className="relative overflow-hidden glass-box p-10">
          {user.display_name ? (
            <button
              className="absolute top-0 right-0 p-2 text-xl"
              onClick={() => setEditProfile(false)}
            >
              x
            </button>
          ) : null}
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
                type={'submit'}
                className="mt-4  text-primary border-2 border-primary px-4 py-2 rounded"
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
