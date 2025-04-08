import React, { ReactNode } from 'react';

import { useModal } from '../../contexts/modalContext/ModalContext';

interface ModalWrapperProps {
  modalName: string;
  children: ReactNode;
}

export const ModalWrapper: React.FC<ModalWrapperProps> = ({ modalName, children }) => {
  const { closeModal } = useModal();

  return (
    <>
      <div
        onClick={() => closeModal(modalName)}
        className="fixed top-0 left-0 w-screen h-screen max-h-screen bg-black bg-opacity-20 z-40"
      ></div>
      <div className="fixed z-50 inset-0 flex justify-center items-center p-4">
        <div className="rounded-xl shadow-lg max-w-md w-full h-full md:h-auto md:max-w-4xl overflow-hidden">
          {children}
        </div>
      </div>
    </>
  );
};
