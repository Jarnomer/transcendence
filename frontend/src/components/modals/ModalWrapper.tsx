import React, { ReactNode } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { useModal } from '@contexts';

import { ModalBackgroundGlitch } from '@components/modals';

interface ModalWrapperProps {
  modalName: string;
  children: ReactNode;
}

const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ modalName, children }) => {
  const { closeModal, isModalOpen } = useModal();

  const handleOverlayClick = () => {
    // console.log('Clicked outside the modal');
    if (modalName !== 'confirmModal' && modalName !== 'editProfile') {
      closeModal(modalName);
    }
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // console.log('modal clicked');
  };

  // console.log('modal');

  return (
    <>
      <AnimatePresence mode="wait">
        {isModalOpen(modalName) && (
          <motion.div
            className="fixed  top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-md flex items-center justify-center z-30"
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={handleOverlayClick}
          >
            <ModalBackgroundGlitch duration={1000}></ModalBackgroundGlitch>

            <motion.div
              className="text-primary w-full h-full md:w-2xl md:h-2xl md:max-h-[70%] relative  flex flex-col justify-center items-center overflow-hidden"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={handleModalClick}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
