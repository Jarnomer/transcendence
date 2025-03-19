import React from 'react';

import { Route, Routes, useLocation } from 'react-router-dom';

import { AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported

import { useUser } from '../../contexts/user/UserContext.tsx';
import { ChatPage } from '../../pages/ChatPage.tsx';
import { CreatorsPage } from '../../pages/CreatorsPage.tsx';
import { GameMenu } from '../../pages/GameMenu.tsx';
import { GamePage } from '../../pages/GamePage.tsx';
import { HomePage } from '../../pages/HomePage.tsx';
import { LoginPage } from '../../pages/LoginPage.tsx';
import { ProfilePage } from '../../pages/ProfilePage.tsx';
import { PageWrapper } from './PageWrapper.tsx';

export const AnimatedRoutes: React.FC = () => {
  const { user } = useUser();
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageWrapper>
              <HomePage />
            </PageWrapper>
          }
        />
        <Route
          path="/login"
          element={
            <PageWrapper>
              <LoginPage />
            </PageWrapper>
          }
        />
        <Route
          path="/home"
          element={
            <PageWrapper>
              <HomePage />
            </PageWrapper>
          }
        />
        <Route
          path="/gameMenu"
          element={
            <PageWrapper>
              <GameMenu />
            </PageWrapper>
          }
        />
        <Route
          path="/game"
          element={
            <PageWrapper>
              <GamePage />
            </PageWrapper>
          }
        />
        <Route
          path="/creators"
          element={
            <PageWrapper>
              <CreatorsPage />
            </PageWrapper>
          }
        />
        <Route
          path="/profile/:userId"
          element={
            <PageWrapper>
              <ProfilePage />
            </PageWrapper>
          }
        />
        <Route
          path="/chat"
          element={
            <PageWrapper>
              <ChatPage />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};
