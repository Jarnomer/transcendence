import React from 'react';

import { useModal } from '@contexts';

import { ModalWrapper } from '@components/modals';
import { ClippedButton, NavIconButton } from '@components/UI';

export const JoinGameNotificationModal: React.FC = () => {
  const { isModalOpen, getModalProps, closeModal } = useModal();

  if (!isModalOpen('joinGameModal')) return null;

  const props = getModalProps('joinGameModal');
  if (!props) return null;

  const { onAccept, onDecline, displayName } = props;

  console.log('joingamemodal props: ', props);

  return (
    <ModalWrapper modalName="joinGameModal">
      <div className="glass-box text-primary w-full h-xl min-h-xl overflow-hidden">
        <div className="w-full flex justify-end bg-primary">
          <div className="flex items-center gap-2 text-black">
            <NavIconButton
              icon="close"
              onClick={() => {
                // playUnSelectSound();
                onDecline();
                closeModal('joinGameModal');
              }}
              id="close-join-game-modal"
              ariaLabel="Close join game notification"
            ></NavIconButton>
          </div>
        </div>
        <div className="flex flex-col p-5 gap-10 justify-end">
          {displayName ? (
            <h1 className="w-full">You have a game starting against: {displayName}</h1>
          ) : (
            <h1 className="w-full">You have a game starting</h1>
          )}
          <div className="w-full flex justify-end gap-4">
            <ClippedButton
              label={'Decline'}
              onClick={() => {
                onDecline();
                closeModal('joinGameModal');
              }}
            />
            <ClippedButton
              label={'Accept'}
              onClick={() => {
                onAccept();
                closeModal('joinGameModal');
              }}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
