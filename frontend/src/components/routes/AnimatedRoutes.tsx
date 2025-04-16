import React from 'react';

import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { AnimatePresence } from 'framer-motion'; // Ensure AnimatePresence is imported

import { useNavigationAccess } from '../../contexts/navigationAccessContext/NavigationAccessContext.tsx';
import { useUser } from '../../contexts/user/UserContext.tsx';
import { ChatPage } from '../../pages/ChatPage.tsx';
import { CreateTournament } from '../../pages/CreateTournament.tsx';
import { CreatorsPage } from '../../pages/CreatorsPage.tsx';
import { GameMenu } from '../../pages/GameMenu.tsx';
import { GameOptionsPage } from '../../pages/GameOptionsPage.tsx';
import { GamePage } from '../../pages/GamePage.tsx';
import { HomePage } from '../../pages/HomePage.tsx';
import { LoginPage } from '../../pages/LoginPage.tsx';
import { NotFoundPage } from '../../pages/NotFoundPage.tsx';
import { ProfilePage } from '../../pages/ProfilePage.tsx';
import { Settings } from '../../pages/Settings.tsx';
import { SignUpPage } from '../../pages/SignUpPage.tsx';
import { TournamentLobby } from '../../pages/TournamentLobby.tsx';
import { PageWrapper } from './PageWrapper.tsx';

export const AnimatedRoutes: React.FC = () => {
  const { loading } = useUser(); // Retrieve user from context
  const location = useLocation();
  const user = localStorage.getItem('token');
  const { fromAppNavigation } = useNavigationAccess();

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
                <CreateTournament />
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
          path="/game"
          element={
            user && fromAppNavigation ? (
              <PageWrapper>
                <GamePage />
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
