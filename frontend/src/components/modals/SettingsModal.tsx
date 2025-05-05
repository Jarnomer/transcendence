import React, { useEffect, useState } from 'react';

import { useModal } from '../../contexts/modalContext/ModalContext';
import { useSound } from '../../hooks/useSound';
import { Settings, SettingsNav } from '../../pages/Settings';
import { ModalWrapper } from './ModalWrapper';

export const SettingsModal: React.FC = () => {
  const { isModalOpen } = useModal();

  const [activeTab, setActiveTab] = useState<string>('soundSettings');

  const playSelectSound = useSound('/sounds/effects/select.wav');

  useEffect(() => {
    playSelectSound();
  }, [activeTab]);

  return (
    <ModalWrapper modalName="settings">
      {isModalOpen('settings') && (
        <>
          <div className="relative w-full h-full overflow-hidden flex flex-col grow-1 items-center">
            <div className="w-full h-8">
              <SettingsNav activeTab={activeTab} setActiveTab={setActiveTab}></SettingsNav>
            </div>
            <Settings activeTab={activeTab}></Settings>
          </div>
        </>
      )}
    </ModalWrapper>
  );
};
