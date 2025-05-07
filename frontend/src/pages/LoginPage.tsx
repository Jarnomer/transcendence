import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useModal, useWebSocketContext } from '@contexts';

import { ClippedButton, ClippedCornerCard } from '@components/UI';

import { login, register, updateUser } from '@services';

import { useSound } from '@hooks';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { chatSocket, gameSocket, matchmakingSocket } = useWebSocketContext();

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const playErrorSound = useSound('/sounds/effects/error.wav');
  const { openModal } = useModal();

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
          // alert('Registration failed!');
          setLoading(false);
          playErrorSound();
          if (error.status === 400) {
            setError('userExists');
          } else {
            alert(error);
          }
          return;
        }
      }

      // THEN LOG IN THE USER
      try {
        const token = await login(username, password);
        const userId = localStorage.getItem('userID');
        const param = new URLSearchParams({ token: token.token, user_id: userId! });
        chatSocket.setAuthParams(param);
        gameSocket.setAuthParams(param);
        matchmakingSocket.setAuthParams(param);
        chatSocket.connect();
        // setToken(token.token); // Update the token in the context
        if (isRegistering) {
          openModal('editProfile');
          navigate(`/gameMenu`);
        } else {
          await updateUser({ status: 'online' });
          navigate(`/gameMenu`);
        }
      } catch (error: any) {
        // alert('Login failed!');
        playErrorSound();
        console.log('error: ', error);
        setLoading(false);
        if (error.status === 400) {
          setError('userExists');
        }
        if (error.status === 404) {
          setError('invalidUser');
        }
        if (error.status === 401) {
          setError('invalidPassword');
        } else {
          alert(error);
        }
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex justify-center p-10">
      <div className="w-[300px]">
        <ClippedCornerCard>
          <div className="text-center">
            <h1 className="text-3xl mb-2 font-heading font-bold">
              {isRegistering ? 'Register' : 'Login'}
            </h1>

            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                className={`border p-2  ${error && (error === 'invalidUser' || error === 'userExists') && 'text-error'}`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              {error && error === 'invalidUser' && (
                <p className="text-xs text-left text-error">User not found</p>
              )}
              {isRegistering && error && error === 'userExists' && (
                <p className="text-xs text-left text-error">Username taken</p>
              )}
              <input
                type="password"
                placeholder="Password"
                className={`border p-2  ${error && error === 'invalidPassword' && 'text-error'}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && error === 'invalidPassword' && (
                <p className="text-xs text-left text-error">invalid password</p>
              )}
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
        </ClippedCornerCard>
      </div>
    </div>
  );
};
