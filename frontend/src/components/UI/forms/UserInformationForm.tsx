import React, { useState } from 'react';

import { motion } from 'framer-motion';

import { UserDataResponseType } from '../../../../../shared/types';
import { useModal } from '../../../contexts/modalContext/ModalContext';
import { useUser } from '../../../contexts/user/UserContext';
import { api } from '../../../services/api';
import { ProfilePicture } from '../../profile/ProfilePicture';
import { InformationRequestSvg } from '../../visual/svg/shapes/UserInformationRequestSvg';
import { ClippedButton } from '../buttons/ClippedButton';
import { NavIconButton } from '../buttons/NavIconButton';

interface EditProfileProps {
  user: UserDataResponseType;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
}

interface FormHeaderProps {
  user: UserDataResponseType;
}

const animationVariants = {
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

const FormField = ({
  id,
  name,
  label,
  value,
  placeholder,
  type = 'text', // default to "text"
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  type?: React.HTMLInputTypeAttribute; // <-- accepts all valid input types
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="relative border px-2 pt-5">
    <label htmlFor={id} className="text-xs absolute top-1 left-2 text-secondary">
      {label}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full placeholder-gray-400 bg-transparent outline-none"
    />
  </div>
);

const FormHeader: React.FC<FormHeaderProps> = ({ user }) => {
  return (
    <>
      <div className="flex w-full  justify-between">
        <div className="flex w-2/3  items-center relative">
          <InformationRequestSvg></InformationRequestSvg>
        </div>
        <div className="w-1/3 p-4">
          <ProfilePicture user={user} isOwnProfile={true}></ProfilePicture>
        </div>
      </div>

      <div className="flex w-full my-2 gap-2 text-left text-xs text-neutral-200" aria-hidden="true">
        <div className="border-1 w-2/3">
          <p className="px-1 text-xs text-neutral-200 opacity-45">user id</p>
          <br></br>
          <p className="px-2 text-neutral-200 opacity-45">{user.user_id?.slice(0, 20)}</p>
        </div>
        <div className="border-1 w-1/3">
          <p className="px-1 text-xs text-neutral-200 opacity-45">Username</p>
          <br></br>
          <p className="px-2 text-neutral-200 opacity-45">{user.username}</p>
        </div>
      </div>
    </>
  );
};

export const UserInformationForm: React.FC<EditProfileProps> = ({ setLoading, loading }) => {
  const { user, refetchUser, loading: userContextLoading } = useUser();
  const { closeModal } = useModal();

  const [formData, setFormData] = useState({
    display_name: user?.display_name ? user.display_name : '',
    first_name: user?.first_name ? user.first_name : '',
    last_name: user?.last_name ? user.last_name : '',
    // email: user?.email ? user.email : '',
    bio: user?.bio ? user.bio : '',
  });

  console.log(user);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!user?.user_id) {
      console.error('User ID not found');
      return;
    }

    if (!formData.display_name) {
      formData.display_name = user.username;
    }

    setLoading(true);
    try {
      const res = await api.patch(`user/${user.user_id}`, formData);
      if (res.status != 200) {
        throw new Error('Failed to update profile');
      }
      refetchUser();
      closeModal('editProfile');
    } catch (error) {
      console.error('Failed to update profile', error);
    }
    setLoading(false);
  };

  if (loading || userContextLoading) {
    return (
      <>
        <span>loading...</span>
      </>
    );
  }

  if (!loading && !userContextLoading && !user) return <span>Error</span>;

  return (
    <>
      {!loading && user ? (
        <>
          {user?.display_name ? (
            <div className="w-full flex  p-2 text-primary items-center">
              <NavIconButton
                id="exit edit profile"
                ariaLabel="exit edit profile"
                icon="close"
                onClick={(e) => {
                  e.stopPropagation();
                  closeModal('editProfile');
                }}
              />
            </div>
          ) : null}
          <motion.div className="text-primary w-full md:w-xl md:h-2xl max-w-xl relative  flex flex-col justify-center items-center overflow-hidden">
            <FormHeader user={user}></FormHeader>
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
                <form
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full"
                  onSubmit={handleSubmit}
                >
                  <FormField
                    id="displayName"
                    name="display_name"
                    label="Display Name"
                    value={formData.display_name}
                    placeholder={user.display_name || 'Missing data'}
                    onChange={handleInputChange}
                  />

                  <FormField
                    type="email"
                    id="email"
                    name="email"
                    label="email"
                    value={formData.email}
                    placeholder={user.email || 'Missing data'}
                    onChange={handleInputChange}
                  />

                  <FormField
                    id="firstName"
                    name="first_name"
                    label="First Name"
                    value={formData.first_name}
                    placeholder={user.first_name || 'Missing data'}
                    onChange={handleInputChange}
                  />

                  <FormField
                    id="lastName"
                    name="last_name"
                    label="Last Name"
                    value={formData.last_name}
                    placeholder={user.last_name || 'Missing data'}
                    onChange={handleInputChange}
                  />

                  {/* Biography (full width) */}
                  <div className="relative border col-span-1 sm:col-span-2">
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
                      className="pt-5 px-2 w-full h-32 resize-none placeholder-gray-400"
                    />
                  </div>

                  <div className="flex w-full justify-end sm:col-span-2 p-2">
                    <ClippedButton label={'Save'} type={'submit'} onClick={handleSubmit} />
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      ) : null}
    </>
  );
};
