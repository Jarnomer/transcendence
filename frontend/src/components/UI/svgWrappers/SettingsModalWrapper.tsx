import React from 'react';

interface SettingsModalWrapperProps {
  closeModal: () => void;
  children: React.ReactNode; // Allow other components to be passed as children
}

export const SettingsModalWrapper: React.FC<SettingsModalWrapperProps> = ({
  closeModal,
  children,
}) => {
  return (
    <>
      <div
        id="modal-overlay"
        className="absolute top-0 w-screen h-screen bg-black opacity-70 "
        onClick={() => closeModal}
      ></div>
      <div
        id="settings-modal"
        className="modal-content w-[600px] relative text-primary text-center"
      >
        <svg
          className="absolute top-0 left-0 w-full pointer-events-none"
          viewBox="0 0 426 245"
          fill="currentColor"
          fillOpacity="15%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 2V218.9L10.85 227.75H173L188.39 243.11H412.4L423.77 231.77V2H2Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeMiterlimit="10"
          />
          <path
            d="M175.881 2L184.941 11.06H368.301L377.301 2.09L175.881 2Z"
            className="fill-primary"
          />
          <path d="M425 234.83L415.82 244.04H424.97L425 234.83Z" className="fill-primary" />
          <path
            d="M175.189 242.21L167.719 234.74H114.439L121.939 242.21H175.189Z"
            className="fill-primary"
          />
          <path
            d="M116.33 242.21L108.86 234.71H103.85L111.38 242.27L116.33 242.21Z"
            className="fill-primary"
          />
          <path
            d="M106.101 242.21L98.6311 234.71H93.6211L101.151 242.27L106.101 242.21Z"
            className="fill-primary"
          />
          <path
            d="M95.301 242.21L87.801 234.71H82.791L90.351 242.27L95.301 242.21Z"
            className="fill-primary"
          />
          <path
            d="M83.2112 242.21L75.7112 234.71H70.7012L78.2612 242.27L83.2112 242.21Z"
            className="fill-primary"
          />
          <path
            opacity="0.1"
            d="M2 2V218.9L10.85 227.75H173L188.39 243.11H412.4L423.77 231.77V2H2Z"
            className="fill-primary"
          />
        </svg>

        {/* Render the children passed into the modal */}
        <div id="settings-modal-content" className="pt-10">
          {children}
        </div>

        <button onClick={closeModal} className="absolute top-4 right-4 text-white">
          Close
        </button>
      </div>
    </>
  );
};

export default SettingsModalWrapper;
