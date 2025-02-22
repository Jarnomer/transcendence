import React, { ReactNode } from 'react';
import { useModal } from '../modals/ModalContext'; // Assuming you're using context

// Basic ModalWrapper that will handle overlay and pass children
export const ModalWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { closeModal } = useModal();

  return (
    <>
      <div
        id="modal-overlay"
        className="fixed top-0 left-0 w-screen h-screen bg-black opacity-70 z-2"
        onClick={closeModal}
      ></div>
      <div className="modal-container fixed top-1/2 left-1/2 z-3">{children}</div>
    </>
  );
};