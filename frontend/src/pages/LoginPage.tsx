import React, { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { ClippedButton } from '@components/UI/buttons/ClippedButton.tsx';
import { SVGModal } from '@components/UI/svgWrappers/svgModal.tsx';

import { login, register } from '@services/authService.ts';

import { useAnimatedNavigate } from '../animatedNavigate';
import { useUser } from '../contexts/user/UserContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const animatedNavigate = useAnimatedNavigate();
  const location = useLocation();
  const { user, setUser, refetchUser, checkAuth, logout } = useUser();

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // IF THE USER IS REGISTERING, REGISTER THE USER FIRST
      if (isRegistering) {
        try {
          await register(username, password);
        } catch (error: any) {
          alert('Registration failed!');
          setLoading(false);
          return;
        }
      }

      // THEN LOG IN THE USER
      try {
        await login(username, password);
        animatedNavigate(`/profile/${localStorage.getItem('userID')}`);
      } catch (error: any) {
        alert('Login failed!');
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex justify-center p-10">
      <div className="w-[300px]">
        <SVGModal>
          <div className="text-center">
            <h1 className="text-3xl mb-2 font-heading font-bold">
              {isRegistering ? 'Register' : 'Login'}
            </h1>
            {error && <p className="text-red-500">{error}</p>}
            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                className="border p-2"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="border p-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <ClippedButton label={isRegistering ? 'Register' : 'Login'} type="submit" />
            </form>
            <div className="text-center flex flex-col gap-2 mt-4">
              <p>{isRegistering ? 'Already have an account?' : "Don't have an account?"}</p>
              <ClippedButton
                label={isRegistering ? 'Go to Login' : 'Register'}
                onClick={() => setIsRegistering(!isRegistering)}
              />
              {!isRegistering && <ClippedButton label="Play as a guest" />}
            </div>
          </div>
        </SVGModal>
      </div>
    </div>
  );
};
