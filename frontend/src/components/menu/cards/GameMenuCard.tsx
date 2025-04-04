import React from 'react';

import { BackgroundGlow } from '../../visual/BackgroundGlow';

interface GameMenuCardProps {
  content: string;
  imageUrl: string;
  hoverInfo: string;
  onClick: () => void;
}

const GameMenuCard: React.FC<GameMenuCardProps> = ({ content, imageUrl, hoverInfo, onClick }) => {
  return (
    <div
      className="game-mode-modal p-0 m-0 relative inline-block overflow-hidden"
      onClick={onClick}
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
            </foreignObject>
          </g>
        </svg>

        {/* Content positioned at the bottom of the card */}
        <div className="content absolute bottom-0 w-full max-w-full flex flex-col items-center gap-10 p-5">
          <h2 className="text-3xl font-heading">{content}</h2>
        </div>
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
  );
};

export default GameMenuCard;
