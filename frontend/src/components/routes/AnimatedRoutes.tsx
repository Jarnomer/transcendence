import React, { useEffect } from 'react';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AnimatePresence } from 'framer-motion';

import {
  ChatPage,
  CreatorsPage,
  GameMenu,
  GameOptionsPage,
  GamePage,
  GameResultPage,
  HomePage,
  LoginPage,
  NotFoundPage,
  ProfilePage,
  Settings,
  SignUpPage,
  TournamentLobby,
  TournamentMenu,
} from '@pages';

import { LoadingProvider, useNavigationAccess, useUser } from '@contexts';

import { useSound } from '@hooks';

// Delete all of these?
import { BracketTest } from '../../pages/testing_pages/BracketTest.tsx';
import { CarouselTest } from '../../pages/testing_pages/CarouselTest.tsx';
import { TestGameResult } from '../../pages/testing_pages/TestGameResult.tsx';
import { PageWrapper } from './PageWrapper.tsx';

export const AnimatedRoutes: React.FC = () => {
  const { checkAuth } = useUser(); // Retrieve user from context
  const location = useLocation();
  const user = localStorage.getItem('token');
  const { fromAppNavigation } = useNavigationAccess();
  const playPageChangeSound = useSound('/sounds/effects/page_change_1.wav');

  useEffect(() => {
    playPageChangeSound();
    checkAuth();
    console.log('location change');
    return () => {
      console.log('Cleanup');
    };
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public route - No authentication required */}
        <Route
          path="/login"
          element={
            <PageWrapper>
              <LoginPage />
            </PageWrapper>
          }
        />

        {/* Protected routes - Redirect to login if no user is authenticated */}
        <Route
          path="/"
          element={user ? <Navigate to="/gameMenu" replace /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/testGameResult"
          element={
            user ? (
              <PageWrapper>
                <TestGameResult />
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/home"
          element={
            user ? (
              <PageWrapper>
                <HomePage />
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/bracketTest"
          element={
            user ? (
              <PageWrapper>
                <BracketTest></BracketTest>
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/tournament"
          element={
            user && fromAppNavigation ? (
              <PageWrapper>
                <TournamentMenu />
              </PageWrapper>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/gameMenu"
          element={
            user ? (
              <PageWrapper>
                <GameMenu />
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/gameOptions"
          element={
            user && fromAppNavigation ? (
              <PageWrapper>
                <GameOptionsPage />
              </PageWrapper>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/game-results"
          element={
            user && fromAppNavigation ? (
              <PageWrapper>
                <GameResultPage />
              </PageWrapper>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/CarouselTest"
          element={
            user && (
              <PageWrapper>
                <CarouselTest />
              </PageWrapper>
            )
          }
        />

        <Route
          path="/game"
          element={
            user && fromAppNavigation ? (
              <PageWrapper>
                <LoadingProvider>
                  <GamePage />
                </LoadingProvider>
              </PageWrapper>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/settings"
          element={
            user ? (
              <PageWrapper>
                <Settings />
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/tournamentLobby"
          element={
            user ? (
              <PageWrapper>
                <TournamentLobby />
              </PageWrapper>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/creators"
          element={
            user ? (
              <PageWrapper>
                <CreatorsPage />
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/signUp"
          element={
            user ? (
              <PageWrapper>
                <SignUpPage />
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/profile/:userId"
          element={
            user ? (
              <PageWrapper>
                <ProfilePage />
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/chat"
          element={
            user ? (
              <PageWrapper>
                <ChatPage />
              </PageWrapper>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            <PageWrapper>
              <NotFoundPage />
            </PageWrapper>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};
