import React from 'react';

import { useNavigate } from 'react-router-dom';

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="h-15 w-screen flex items-center justify-center  border-primary border-t-1 text-center">
      <div id="footer-links" className="flex gap-5">
        <p>about</p>
        <p id="link-creators" onClick={() => navigate('creators')}>
          creators
        </p>
        <a href="https://github.com/jarnomer/transcendence/" target="_blank" rel="noreferrer">
          github
        </a>
      </div>
    </footer>
  );
};
