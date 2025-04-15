import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';

import { BackgroundGlow } from '../../BackgroundGlow';

export const ListSvgContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supportsForeignObject, setSupportsForeignObject] = useState(true);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  console.log('is safari:', isSafari);

  useEffect(() => {
    const testSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const testForeignObject = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'foreignObject'
    );

    try {
      testSvg.appendChild(testForeignObject);
      if (testSvg.contains(testForeignObject)) {
        setSupportsForeignObject(true);
      } else {
        setSupportsForeignObject(false);
      }
    } catch (e) {
      setSupportsForeignObject(false);
    }
  }, []);

  // h-[57px] min-w-[282px]
  return !isSafari ? (
    <div className="w-full ">
      <svg viewBox="0 0 282 57" xmlns="http://www.w3.org/2000/svg" className="h-full">
        <path
          d="M275.149 56H1V1H51.1493L54.4925 4.02752H281V48.9358L275.149 56Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          fillOpacity="0.2"
        />
        <foreignObject
          x="1"
          y="5"
          className=" h-full"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/xhtml"
        >
          <div>
            <BackgroundGlow></BackgroundGlow>
          </div>
          <div className=" ">{children}</div>
        </foreignObject>
      </svg>
    </div>
  ) : (
    <motion.div className=" overflow-hidden  relative w-[282px]">
      <BackgroundGlow></BackgroundGlow>
      <motion.svg
        className="absolute top-0 left-0 w-full h-full"
        viewBox="0 0 282 57"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M275.149 56H1V1H51.1493L54.4925 4.02752H281V48.9358L275.149 56Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2"
          fillOpacity="0.2"
        />
      </motion.svg>
      <div className="h-full w-full">{children}</div>
    </motion.div>
  );
};
