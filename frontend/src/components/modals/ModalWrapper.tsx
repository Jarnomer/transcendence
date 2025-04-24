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
      className="fixed p-2 top-0 left-0 w-screen h-screen bg-black/50 backdrop-blur-md flex items-center justify-center z-40"
      onClick={handleOverlayClick}
    >
      <div
        className="text-primary  w-full h-full md:w-2xl md:h-2xl relative shadow-lg flex flex-col justify-center items-center overflow-hidden"
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
