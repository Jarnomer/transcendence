import React from 'react';

import { Settings } from '@pages';

import { useModal } from '@contexts';

import { ModalWrapper } from '@components/modals';

export const SettingsModal: React.FC = () => {
  const { isModalOpen } = useModal();

  return (
    <ModalWrapper modalName="settings">
      {isModalOpen('settings') && (
        <div className="relative w-full h-full md:h-2xl md:max-h-[70%] overflow-hidden flex flex-col grow-1 items-center">
          <Settings initialTab="graphicsSettings" />
        </div>
      )}
    </ModalWrapper>
  );
};
