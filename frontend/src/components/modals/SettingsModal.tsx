import React from 'react';

import { ModalWrapper } from './ModalWrapper';
import { useModal } from '../../contexts/modalContext/ModalContext';
import { useUser } from '../../contexts/user/UserContext';
import { Settings } from '../../pages/Settings';

export const SettingsModal: React.FC = () => {
  const { isModalOpen, closeModal } = useModal();

  const { user } = useUser();

  if (!isModalOpen('settings')) return null;

  return (
    <ModalWrapper modalName="settings">
      <div className="relative w-full h-full max-h-screen sm:w-3xl flex items-center">
        <Settings></Settings>
      </div>
    </ModalWrapper>
  );
};
