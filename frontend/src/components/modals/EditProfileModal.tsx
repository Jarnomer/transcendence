import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useModal, useUser } from '@contexts';

import { ModalWrapper } from '@components/modals';
import { UserInformationForm } from '@components/UI';

export const EditProfileModal: React.FC = () => {
  const { isModalOpen } = useModal();
  const [loading, setLoading] = useState(false);

  const { user, loading: userContextLoading } = useUser();

  if (loading || userContextLoading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user && !loading && !userContextLoading) {
    return <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>;
  }

  return (
    <ModalWrapper modalName="editProfile">
      {isModalOpen('editProfile') && !loading && user && !userContextLoading ? (
        <AnimatePresence>
          <motion.div
            key="editSection"
            className="w-full h-full flex items-center justify-start flex-col p-2 md:p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <UserInformationForm loading={loading} setLoading={setLoading} user={user} />
          </motion.div>
        </AnimatePresence>
      ) : null}
    </ModalWrapper>
  );
};
