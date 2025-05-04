import React from 'react';

import { ModalWrapper } from './ModalWrapper';
import { useModal } from '../../contexts/modalContext/ModalContext';
import { Settings } from '../../pages/Settings';

export const SettingsModal: React.FC = () => {
  const { isModalOpen } = useModal();

  return (
    <ModalWrapper modalName="settings">
      {isModalOpen('settings') && (
        <div className="relative w-full h-[70%] overflow-y-scroll border-1  sm:w-3xl flex items-center">
          <Settings></Settings>
        </div>
      )}
    </ModalWrapper>
  );
};
