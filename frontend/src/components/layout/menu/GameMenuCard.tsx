import React from 'react';

import { BackgroundGlow } from '@components/visual';

import { useSound } from '@hooks';

interface GameMenuCardProps {
  content: string;
  imageUrl: string;
  hoverInfo: string;
  onClick: () => void;
}

export const GameMenuCard: React.FC<GameMenuCardProps> = ({
  content,
  imageUrl,
  hoverInfo,
  onClick,
}) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  // const playSubmitSound = useSound('/sounds/effects/button_submit.wav');
  const playHoverSound = useSound('/sounds/effects/button_hover.wav');

  // const handleOnClick = () => {
  //   playSubmitSound();
  //   onClick();
  // };

  return !isSafari ? (
    <div
      className="game-mode-modal @container-normal p-0 m-0 relative inline-block overflow-hidden"
      onClick={onClick}
      onMouseEnter={playHoverSound}
    >
      <div className="w-full h-full flex flex-col p-0 m-0 items-center text-center gap-5">
        <svg
          className="w-full h-auto"
          height="553"
          viewBox="0 0 424 553"
          fill="black"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_2018_3)">
            <path
              d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z"
              stroke="currentColor"
              strokeWidth="3"
              fill="currentColor"
              fillOpacity="0.2"
            />
            <path
              d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z"
              stroke="currentColor"
              strokeWidth="2"
              className="creator-img-container stroke-2 fill-primary"
            />
          </g>
          <g>
            <foreignObject
              aria-hidden="true"
              xmlns="http://www.w3.org/1999/xhtml"
              width="100%"
              height="100%"
            >
              <div style={{ width: '100%', height: '100%' }}>
                <img
                  src={imageUrl}
                  alt=""
                  role="presentation"
                  style={{
                    width: '100%',
                    clipPath: 'url(#image-mask)',
                    WebkitClipPath: 'url(#image-mask)',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'currentColor',
                  mixBlendMode: 'color',
                  clipPath: 'url(#image-mask)',
                  WebkitClipPath: 'url(#image-mask)',
                }}
              ></div>
              {/* Content positioned at the bottom of the card */}
              <div className="content @sm:text-xs absolute bottom-0 w-full flex flex-col justify-center items-center gap-10 p-5">
                <h2 className="text-5xl  font-heading">{content}</h2>
              </div>
            </foreignObject>
          </g>
        </svg>
      </div>

      <div
        className="hover-info-wrapper max-w-full absolute top-full left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ display: 'none' }}
      >
        <div className="hover-info-content p-4 text-white text-sm rounded-lg shadow-lg">
          {hoverInfo}
        </div>
      </div>
      <BackgroundGlow></BackgroundGlow>
    </div>
  ) : (
    <div
      className="game-mode-modal @container-normal p-0 m-0 relative inline-block overflow-hidden"
      onClick={onClick}
      onMouseEnter={playHoverSound}
    >
      <div className="w-full h-full flex flex-col p-0 m-0 items-center text-center gap-5">
        <svg
          id="creator"
          className="w-full m-0 z-10 text-white/80"
          viewBox="0 0 448 577"
          fillOpacity="1"
          xmlns="http://www.w3.org/2000/svg"
          strokeWidth="3"
          fill="currentColor"
        >
          <defs>
            <clipPath id="image-mask">
              <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" />
            </clipPath>
          </defs>

          <path
            className="text-primary"
            d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z"
            stroke="currentColor"
            strokeWidth="5"
            fill="currentColor"
            fillOpacity="0.3"
          />
          <path
            className="creator-img-container text-primary/50"
            d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z"
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="1"
          />
          <g className="text-primary">
            <image
              href={imageUrl}
              x="26"
              y="17"
              width="400"
              height="400"
              clipPath="url(#image-mask)"
            />
            <path
              className="creator-img-container text-primary"
              d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="1"
              style={{
                mixBlendMode: 'color',
              }}
            />
          </g>
        </svg>

        <div className="content tex-2xl sm:text-4xl absolute bottom-0 w-full flex flex-col justify-center items-center gap-10 p-5">
          <h2 className=" font-heading">{content}</h2>
        </div>
      </div>
    </div>
  );
};

// <div
//   className="game-mode-modal relative  p-5 m-0 w-full h-full glass-box overflow-hidden"
//   onClick={onClick}
// >
//   <BackgroundGlow></BackgroundGlow>
//   <div className="w-full h-full relative mb-2">
//     <div className="" style={{ width: '100%', height: '100%' }}>
//       <img src={imageUrl} alt="" role="presentation" className="object-cover border-1" />
//     </div>
//     <div className="absolute top-0 left-0" style={{ width: '100%', height: '100%' }}>
//       <div
//         className="w-full h-full"
//         style={{
//           backgroundColor: 'currentColor',
//           mixBlendMode: 'color',
//         }}
//       ></div>
//     </div>
//   </div>
//   {/* Content positioned at the bottom of the card */}
//   <div className="content">
//     <h2 className="text-3xl font-heading pb-0">{content}</h2>
//   </div>
// </div>

// <div
//   className="game-mode-modal @container-normal p-0 m-0 relative inline-block overflow-hidden"
//   onClick={handleOnClick}
// >
//   <div className="svg-card-wrapper relative w-full h-full min-w-[300px] grid overflow-hidden  text-center">
//     <svg
//       className="w-full h-auto col-start-1 row-start-1"
//       height="553"
//       viewBox="0 0 424 553"
//       fill="black"
//       xmlns="http://www.w3.org/2000/svg"
//     >
//       <g clipPath="url(#clip0_2018_3)">
//         <path
//           d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z"
//           stroke="currentColor"
//           strokeWidth="3"
//           fill="currentColor"
//           fillOpacity="0.2"
//         />
//         <path
//           d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z"
//           strokeWidth="2"
//           className="creator-img-container stroke-2 "
//           fill="currentColor"
//         />
//       </g>

//       <defs>
//         <clipPath id="menuCardImg" clipPathUnits="objectBoundingBox">
//           <path d="M0.1558 0.0435L0.0625 0.1265V1H0.9089L0.9975 0.9216V0.0435H0.1558Z" />
//         </clipPath>
//       </defs>
//     </svg>

//     <div
//       className="col-start-1 row-start-1 w-full h-full min-w-[300px] overflow-hidden p-0"
//       style={{
//         clipPath: 'url(#menuCardImg)',
//         WebkitClipPath: 'url(#menuCardImg)',
//       }}
//     >
//       <img
//         className="object-cover overflow-hidden"
//         src={imageUrl}
//         alt=""
//         role="presentation"
//         style={{
//           width: '100%',
//           objectFit: 'cover',
//           clipPath: 'url(#menuCardImg)',
//           WebkitClipPath: 'url(#menuCardImg)',
//         }}
//       />
//     </div>
//     <MultiPlayerMenuSvg></MultiPlayerMenuSvg>
//   </div>

//   <div className="content @sm:text-xs absolute bottom-0 w-full flex flex-col items-center gap-10 p-5">
//     <h2 className="text-3xl  font-heading">{content}</h2>
//   </div>
//   <div
//     className="hover-info-wrapper max-w-full absolute top-full left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
//     style={{ display: 'none' }}
//   >
//     <div className="hover-info-content p-4 text-white text-sm rounded-lg shadow-lg">
//       {hoverInfo}
//     </div>
//   </div>
//   <BackgroundGlow></BackgroundGlow>
// </div>;
