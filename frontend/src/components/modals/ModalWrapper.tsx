import React, { ReactNode } from 'react';

import { useModal } from '../../contexts/modalContext/ModalContext';

interface ModalWrapperProps {
  modalName: string;
  children: ReactNode;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ modalName, children }) => {
  const { closeModal } = useModal();

  const handleOverlayClick = () => {
    console.log('Clicked outside the modal');
    closeModal(modalName);
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="text-primary shadow-lg max-w-md w-full h-full md:h-auto md:max-w-4xl overflow-hidden"
        onClick={handleModalClick}
      >
        {children}
      </div>
    </div>
  );
};
