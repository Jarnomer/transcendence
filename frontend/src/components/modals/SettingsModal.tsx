import React from 'react';

import SettingsModalWrapper from '../UI/svgWrappers/SettingsModalWrapper';
import { useModal } from './ModalContext';

export const SettingsModal: React.FC = () => {
  const { isModalOpen, closeModal } = useModal();
  if (!isModalOpen('settingsModal')) return null;

  const handleColorChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const selectedColor = event.currentTarget.getAttribute('data-color');
    if (selectedColor) {
      document.documentElement.style.setProperty('--color-primary', selectedColor);
    }
  };

  return (
    <>
      <SettingsModalWrapper closeModal={() => closeModal('settingsModal')}>
        <h1 className="text-3xl mb-4 font-heading font-bold">Settings</h1>
        <p className="mb-4">Not much to do here yet...</p>
        <p>Maybe change the colors of the page?</p>
        <label>Choose a color:</label>
        <div id="colorPickerContainer" className="mt-3 gap-0">
          <button
            className="color-option border-black border-2 w-8 h-8 mx-0"
            data-color="#76f7fd"
            style={{ backgroundColor: '#76f7fd' }}
            onClick={handleColorChange}
          ></button>
          <button
            className="color-option border-black border-2 w-8 h-8 mx-0"
            data-color="#d6ec6f"
            style={{ backgroundColor: '#d6ec6f' }}
            onClick={handleColorChange}
          ></button>
          <button
            className="color-option border-black border-2 w-8 h-8 mx-0"
            data-color="#61d27e"
            style={{ backgroundColor: '#61d27e' }}
            onClick={handleColorChange}
          ></button>
          <button
            className="color-option border-black border-2 w-8 h-8 mx-0"
            data-color="#ea355a"
            style={{ backgroundColor: '#ea355a' }}
            onClick={handleColorChange}
          ></button>
        </div>
      </SettingsModalWrapper>
    </>
  );
};
