import React, { useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import { UserDataResponseType } from '../../../../shared/types';
import { useUser } from '../../contexts/user/UserContext';
import { api } from '../../services/api';
import { ProfilePicture } from '../profile/ProfilePicture';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { InformationRequestSvg } from '../visual/svg/shapes/UserInformationRequestSvg';

interface EditProfileProps {
  user: UserDataResponseType;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setEditProfile: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
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

export const UserInformationForm: React.FC<EditProfileProps> = ({
  setEditProfile,
  setLoading,
  loading,
}) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setUser } = useUser();
  // const [loading, setLoading] = useState<boolean>();

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
      navigate(`/profile/${localStorage.getItem('userID')}`);
    } catch (error) {
      console.error('Failed to update profile', error);
    }
    setLoading(false);
  };

  if (loading) {
    return <></>;
  }

  return (
    <>
      {!loading ? (
        <motion.div className=" backdrop-blur-md z-30">
          <motion.div className="text-primary w-full h-full md:w-2xl md:h-2xl relative shadow-lg flex flex-col justify-center items-center overflow-hidden">
            <div className="justify-center w-full max-w-lg  flex flex-col ">
              {user.display_name ? (
                <div className="w-full flex justify-end p-2 items-center">
                  <NavIconButton
                    id="exit edit profile"
                    ariaLabel="exit edit profile"
                    icon="close"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditProfile(false);
                    }}
                  />
                </div>
              ) : null}
              <div className="flex w-full  justify-between">
                <div className="flex w-2/3  items-center relative">
                  <InformationRequestSvg></InformationRequestSvg>
                </div>
                <div className="relative">
                  <ProfilePicture user={user} isOwnProfile={true}></ProfilePicture>
                </div>
              </div>
              <motion.div
                className="relative w-full overflow-hidden"
                variants={animationVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div
                  id="edit-profile-content"
                  className="relative w-full overflow-hidden border-primary"
                >
                  <div className="w-full">
                    <div className="flex mb-2 gap-2 text-left text-xs" aria-hidden="true">
                      <div className="border-1 w-2/3">
                        <p className="px-1 text-xs text-neutral-200 opacity-45">user id</p>
                        <br></br>
                        <p className="px-2 text-neutral-200 opacity-45">
                          {user.user_id?.slice(0, 20)}
                        </p>
                      </div>
                      <div className="border-1 w-1/3">
                        <p className="px-1 text-xs text-neutral-200 opacity-45">Username</p>
                        <br></br>
                        <p className="px-2 text-neutral-200 opacity-45">{user.username}</p>
                      </div>
                    </div>
                    <form className="flex w-full flex-col justify-center" onSubmit={handleSubmit}>
                      <span className="flex flex-row relative">
                        <div className="border relative">
                          <label htmlFor="displayName">
                            <span className="text-xs absolute top-1 left-1 text-secondary">
                              Display Name *
                            </span>
                          </label>

                          <input
                            type="text"
                            name="display_name"
                            id="displayName"
                            required
                            placeholder={user.display_name ? user.display_name : 'Missing data'}
                            value={formData.display_name}
                            onChange={handleInputChange}
                            className="pt-5 px-2"
                          />
                        </div>
                        <div className="border-1 w-full relative border-r-primary">
                          <span className="text-xs absolute top-1 left-1 text-secondary">
                            Email
                          </span>
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
                          <label htmlFor="firstName">
                            <span className="text-xs absolute top-1 left-1 text-secondary">
                              First Name
                            </span>
                          </label>
                          <input
                            type="text"
                            id="firstName"
                            name="first_name"
                            placeholder={user.first_name ? user.first_name : 'Missing data'}
                            value={formData.first_name}
                            onChange={handleInputChange}
                            className="pt-5 px-2"
                          />
                        </div>
                        <div className="border relative">
                          <label htmlFor="lastName">
                            <span className="text-xs absolute top-1 left-1 text-secondary">
                              Last Name
                            </span>
                          </label>
                          <input
                            type="text"
                            name="last_name"
                            id="lastName"
                            placeholder={user.last_name ? user.last_name : 'Missing data'}
                            value={formData.last_name}
                            onChange={handleInputChange}
                            className="pt-5 px-2"
                          />
                        </div>
                      </span>
                      <div className="border flex flex-row w-full relative">
                        <label htmlFor="bio">
                          <span className="text-xs absolute top-1 left-1 text-secondary">
                            Biography
                          </span>
                        </label>
                        <textarea
                          name="bio"
                          id="bio"
                          placeholder="Write something about yourself..."
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="pt-5 px-2 border w-full h-32 resize-none"
                        />
                      </div>
                      <button
                        type={'submit'}
                        className="mt-2 w-1/2 text-primary border-2 border-primary px-4 py-2"
                      >
                        Save
                      </button>
                    </form>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
};
