import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnimatedNavigate } from '../../animatedNavigate';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const animatedNavigate = useAnimatedNavigate();

  return (
    <footer className="h-15 w-screen flex items-center justify-center  border-primary border-t-1 text-center">
      <div id="footer-links" className="flex gap-5">
        <p>about</p>
        <p id="link-creators" onClick={() => animatedNavigate('creators')}>
          creators
        </p>
        <a href="https://github.com/jarnomer/transcendence/" target="_blank">
          github
        </a>
      </div>
    </footer>
  );
};
