import React, { useEffect, useState } from 'react';

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

  return !isSafari ? (
    <div className="w-full h-[57px] min-w-[282px]">
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
    <div className="w-full h-full glass-box">{children}</div>
  );
};
