import React from 'react';

import { AnimatePresence, motion } from 'framer-motion';

export const ProcessingBar: React.FC<{ activeTab: string; duration: number }> = ({ duration }) => {
  console.log(duration / 1000);
  return (
    <AnimatePresence>
      <motion.svg
        className="scale-y-[-1]"
        width="216"
        height="110"
        viewBox="0 0 216 110"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="reveal-bar">
            <motion.rect
              initial={{ width: 0 }}
              animate={{ width: 216 }}
              transition={{ duration: duration / 1000, ease: 'easeOut' }}
              height="110"
              x="0"
              y="0"
            />
          </clipPath>
        </defs>

        <path
          d="M68.5293 87.1997H195.874V73.4297H68.5293V87.1997Z"
          fill="currentColor"
          clipPath="url(#reveal-bar)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M195.475 87.6946H67.9902V72.9346H195.475V87.6946ZM69.0252 86.6596H194.44V73.9696H69.0252V86.6596Z"
          fill=" currentColor"
        />

        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M208.795 102.95H54.6699V35.0449H208.795V102.95ZM55.7049 101.915H207.805V36.0349H55.7049V101.915Z"
          fill=" currentColor"
        />
        <g opacity="0.4">
          <path
            d="M215.996 49.4004H215.006V28.4754H194.081V27.4404H215.996V49.4004Z"
            fill=" currentColor"
          />
          <path
            d="M48.4607 49.4004H47.4707V27.4404H69.3857V28.4754H48.4607V49.4004Z"
            fill=" currentColor"
          />
          <path
            d="M215.996 109.25H194.081V108.215H215.006V87.3354H215.996V109.25Z"
            fill=" currentColor"
          />
          <path
            d="M69.3857 109.25H47.4707V87.3354H48.4607V108.215H69.3857V109.25Z"
            fill=" currentColor"
          />
        </g>
        <g opacity="0.4">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M18.3993 18.3046H5.5293V5.43457H18.3993V18.3046ZM6.5643 17.2696H17.3643V6.42457H6.5643V17.2696Z"
            fill=" currentColor"
          />
        </g>
        <path d="M14.6657 14.57H9.2207V9.125H14.6657V14.57Z" fill=" currentColor" />
        <path
          d="M23.3506 6.65035H22.3156V1.47535H17.1406V0.485352H23.3506V6.65035Z"
          fill=" currentColor"
        />
        <path
          d="M1.79477 6.65035H0.759766V0.485352H6.96977V1.47535H1.79477V6.65035Z"
          fill=" currentColor"
        />
        <path
          d="M23.3506 22.8955H17.1406V21.9055H22.3156V16.7305H23.3506V22.8955Z"
          fill=" currentColor"
        />
        <path
          d="M6.96977 22.8955H0.759766V16.7305H1.79477V21.9055H6.96977V22.8955Z"
          fill=" currentColor"
        />
        <path
          d="M47.975 35.06H34.295L23 23.72L23.72 23L34.745 34.025H47.975V35.06Z"
          fill=" currentColor"
        />
      </motion.svg>
    </AnimatePresence>
  );
};
