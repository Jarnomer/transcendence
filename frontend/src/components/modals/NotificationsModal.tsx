import React from 'react';

import { useModal } from '@contexts';

import { ModalWrapper } from '@components/modals';
import { Notifications } from '@components/UI';

export const NotificationsModal: React.FC = () => {
  const { isModalOpen } = useModal();

  return (
    <ModalWrapper modalName="notifications">
      {isModalOpen('notifications') && (
        <div className="relative w-full h-full md:h-2xl md:max-h-[70%] overflow-hidden flex flex-col grow-1 items-center">
          <Notifications></Notifications>
        </div>
      )}
    </ModalWrapper>
  );
};
