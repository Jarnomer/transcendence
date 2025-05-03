import React from 'react';

import { useModal } from '../../contexts/modalContext/ModalContext';
import { ClippedButton } from '../UI/buttons/ClippedButton';
import { NavIconButton } from '../UI/buttons/NavIconButton';
import { ModalWrapper } from './ModalWrapper';

const errorMessages: Record<number, React.ReactNode> = {
  413: (
    <>
      <p>The selected file is too large.</p>
      <p>Please choose a smaller image.</p>
    </>
  ),
  400: (
    <>
      <p>Bad request.</p>
      <p>Please check the file and try again.</p>
    </>
  ),
  500: (
    <>
      <p>Server error.</p>
      <p>Please try again later.</p>
    </>
  ),
};

export const ErrorModal: React.FC = () => {
  const { isModalOpen, getModalProps, closeModal } = useModal();

  if (!isModalOpen('errorModal')) return null;

  const props = getModalProps('errorModal');
  if (!props) return null;

  const { statusCode } = props;

  const message = errorMessages[statusCode] ?? (
    <>
      <p>Something went wrong.</p>
      <p>Please try again.</p>
    </>
  );

  console.log('errorModal props: ', props);

  return (
    <ModalWrapper modalName="errorModal">
      <div className="glass-box text-primary w-full h-xl min-h-xl overflow-hidden">
        <div className="w-full flex justify-end bg-primary">
          <div className="flex items-center gap-2 text-black">
            <NavIconButton
              icon="close"
              onClick={() => {
                // playUnSelectSound();
                closeModal('errorModal');
              }}
              id="close-join-game-modal"
              ariaLabel="Close join game notification"
            ></NavIconButton>
          </div>
        </div>
        <div className="flex flex-col p-5 gap-10 justify-end">
          {message}
          <div className="w-full flex justify-end gap-4">
            <ClippedButton
              label={'Ok'}
              onClick={() => {
                closeModal('errorModal');
              }}
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
