import React from 'react';

import { useModal } from '../../contexts/modalContext/ModalContext';
import { useUser } from '../../contexts/user/UserContext';
import { Settings } from '../../pages/Settings';
import { ModalWrapper } from './ModalWrapper';

export const SettingsModal: React.FC = () => {
  const { isModalOpen, closeModal } = useModal();

  const { user } = useUser();

  return (
    <ModalWrapper modalName="settings">
      {isModalOpen('settings') && (
        <div className="relative w-full h-[70%] overflow-y-scroll  sm:w-3xl flex items-center">
          <Settings></Settings>
        </div>
      )}
    </ModalWrapper>
  );
};
