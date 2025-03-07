// ModalContext.tsx
import React, { createContext, useState, ReactNode, useContext } from 'react';
import { SettingsModal } from './SettingsModal';
import { AuthModal } from './authModal';

type ModalContextType = {
  isModalOpen: (modalName: string) => boolean;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openModals, setOpenModals] = useState<string[]>([]);

  const openModal = (modalName: string) => {
    setOpenModals((prev) => [...prev, modalName]);
  };

  const closeModal = (modalName: string) => {
    setOpenModals((prev) => prev.filter((name) => name !== modalName));
  };

  const isModalOpen = (modalName: string) => openModals.includes(modalName);

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
