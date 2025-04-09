import React from 'react';

import { useModal } from '../../contexts/modalContext/ModalContext';
import { useUser } from '../../contexts/user/UserContext';
import { Settings } from '../../pages/Settings';
import { ModalWrapper } from './ModalWrapper';

export const SettingsModal: React.FC = () => {
  const { isModalOpen, closeModal } = useModal();

  const { user } = useUser();

  if (!isModalOpen('settings')) return null;

  return (
    <ModalWrapper modalName="settings">
      <Settings></Settings>
    </ModalWrapper>
  );
};
