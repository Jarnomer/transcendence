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
    console.log('modal clicked');
  };

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen bg-black/80 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="text-primary relative shadow-lg flex flex-col justify-center items-center overflow-hidden"
        onClick={handleModalClick}
      >
        {/* <span className="absolute right-0 top-0">
          <NavIconButton
            id="settings-modal-close-button"
            ariaLabel="Close settings modal"
            icon="close"
            onClick={handleOverlayClick}
          />
        </span> */}

        {children}
      </div>
    </div>
  );
};
