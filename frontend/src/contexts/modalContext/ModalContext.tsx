import React, { createContext, ReactNode, useContext, useState } from 'react';

type OpenModalEntry = {
  name: string;
  props?: Record<string, any>;
};

type ModalContextType = {
  isModalOpen: (modalName: string) => boolean;
  openModal: (modalName: string, props?: Record<string, any>) => void;
  closeModal: (modalName: string) => void;
  getModalProps: (modalName: string) => Record<string, any> | undefined;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [openModals, setOpenModals] = useState<OpenModalEntry[]>([]);

  const openModal = (modalName: string, props?: Record<string, any>) => {
    setOpenModals((prev) => [...prev, { name: modalName, props }]);
  };

  const closeModal = (modalName: string) => {
    setOpenModals((prev) => prev.filter((modal) => modal.name !== modalName));
  };

  const isModalOpen = (modalName: string) => {
    return openModals.some((modal) => modal.name === modalName);
  };

  const getModalProps = (modalName: string) => {
    return openModals.find((modal) => modal.name === modalName)?.props;
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, openModal, closeModal, getModalProps }}>
      {children}
    </ModalContext.Provider>
  );
};
