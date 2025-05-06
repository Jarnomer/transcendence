import React from 'react';

import { useModal } from '@contexts';

import { ModalWrapper } from '@components/modals';
import { ClippedButton } from '@components/UI';
import { WarningSign } from '@components/visual';

export const ConfirmModal: React.FC = () => {
  const { isModalOpen, closeModal, getModalProps } = useModal();

  const { message, onConfirm, onCancel } = getModalProps('confirmModal') || {};

  const handleConfirm = () => {
    closeModal('confirmModal');
    onConfirm?.();
  };

  const handleCancel = () => {
    closeModal('confirmModal');
    onCancel?.();
  };

  return (
    <ModalWrapper modalName="confirmModal">
      {isModalOpen('confirmModal') && (
        <div className="relative flex flex-col gap-2  sm:p-2">
          <WarningSign />
          <div className="glass-box h-40 min-h-40 text-center">
            <div className="w-full bg-primary text-start p-1">
              <h1 className="text-black">Confirmation required</h1>
            </div>
            <div className="p-4 w-full flex flex-col justify-between ">
              <p>{message || 'Are you sure?'}</p>
              <div className="flex justify-center  gap-4 mt-4">
                <ClippedButton label="Cancel" onClick={handleCancel} />
                <ClippedButton label="Continue" onClick={handleConfirm} />
              </div>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  );
};
