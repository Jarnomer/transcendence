import React from 'react';

import { Route, Routes, useLocation } from 'react-router-dom';

import { AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported

import { useUser } from './contexts/user/UserContext.tsx';
import { ChatPage } from './pages/ChatPage.tsx';
import { CreatorsPage } from './pages/CreatorsPage.tsx';
import { GameMenu } from './pages/GameMenu.tsx';
import { GamePage } from './pages/GamePage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';

export const AnimatedRoutes: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={user ? <GameMenu /> : <LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={user ? <HomePage /> : <LoginPage />} />
        <Route path="/gameMenu" element={user ? <GameMenu /> : <LoginPage />} />
        <Route path="/game" element={user ? <GamePage /> : <LoginPage />} />
        <Route path="/creators" element={<CreatorsPage />} />
        <Route path="/profile/:userId" element={user ? <ProfilePage /> : <LoginPage />} />
        <Route path="/chat" element={user ? <ChatPage /> : <LoginPage />} />
      </Routes>
    </AnimatePresence>
  );
};
