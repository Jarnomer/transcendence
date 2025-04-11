import React from 'react';

import { useModal } from '../../contexts/modalContext/ModalContext';
import { useUser } from '../../contexts/user/UserContext';
import { Settings } from '../../pages/Settings';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { ModalWrapper } from './ModalWrapper';

export const SettingsModal: React.FC = () => {
  const { isModalOpen, closeModal } = useModal();

  const { user } = useUser();

  if (!isModalOpen('settings')) return null;

  const handleCloseClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    console.log('Clicked outside the modal');
    closeModal('settings');
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {};

  const handleCloseSettingsClick = () => {
    console.log('close button clicked');
  };

  return (
    <ModalWrapper modalName="settings">
      <div className="relative">
        <span className="absolute right-0">
          <NavIconButton
            id="settings-modal-close-button"
            ariaLabel="Close settings modal"
            icon="close"
            onClick={() => handleCloseClick}
          />
        </span>
        <Settings></Settings>
      </div>
    </ModalWrapper>
  );
};
