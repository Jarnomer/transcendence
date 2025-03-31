import React from 'react';

export const BackgroundGlow: React.FC = () => {
  return (
    <div aria-hidden="true" className="parent pointer-events-none">
      <div className="">
        <div id="">
          <div className="">
            <div className="cyber-lines">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <div className="scan-line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
