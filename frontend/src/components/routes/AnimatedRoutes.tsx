import React, { useEffect, useRef } from 'react';

import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

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

import { PageWrapper } from '@components/routes';

import { useDuel, useSound } from '@hooks';

export const AnimatedRoutes: React.FC = () => {
  const { checkAuth } = useUser(); // Retrieve user from context
  const location = useLocation();
  const user = localStorage.getItem('token');
  const { fromAppNavigation } = useNavigationAccess();

  const navigate = useNavigate();
  const prevLocationRef = useRef(location);

  const playPageChangeSound = useSound('/sounds/effects/page_change_1.wav');

  useEffect(() => {
    playPageChangeSound();
    checkAuth();
    
    // Check if navigating from /game to /tournamentLobby -> go to gameMenu instead of gameOptions
    if (prevLocationRef.current.pathname === '/game' && location.pathname === '/tournamentLobby') {
      navigate('/gameMenu', { replace: true });
    }
    
    prevLocationRef.current = location;
    
    console.log('location change');
    return () => {
      console.log('Cleanup');
    };
  }, [location, navigate]);

  useDuel();

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
            user && fromAppNavigation ? (
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
