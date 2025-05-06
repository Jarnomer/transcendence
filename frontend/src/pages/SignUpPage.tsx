import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useUser } from '@contexts';

import { UserInformationForm } from '@components/UI/forms/UserInformationForm';

// const animationVariants = {
//   initial: {
//     clipPath: 'inset(0 100% 0 0)',
//     opacity: 0,
//   },
//   animate: {
//     clipPath: 'inset(0 0% 0 0)',
//     opacity: 1,
//     transition: { duration: 0.4, ease: 'easeInOut', delay: 0.3 },
//   },
//   exit: {
//     clipPath: 'inset(0 100% 0 0)',
//     opacity: 0,
//     transition: { duration: 0.4, ease: 'easeInOut' },
//   },
// };

export const SignUpPage: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const { user, loading: userContextLoading } = useUser();

  if (loading || userContextLoading) {
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  }

  if (!user && !loading && !userContextLoading) {
    return <div className="text-center mt-10 text-lg text-red-500">Failed to load user data.</div>;
  }

  return (
    <>
      {!loading && user && !userContextLoading ? (
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
    </>
  );
};
