import React, { useState } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import { login, register } from '../../services/authService.ts';
import { ClippedButton } from '../UI/buttons/ClippedButton.tsx';
import { SVGModal } from '../UI/svgWrappers/svgModal.tsx';
import { useModal } from './ModalContext';
import { ModalWrapper } from './ModalWrapper.tsx';

export const AuthModal: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const { isModalOpen, closeModal } = useModal();

  if (!isModalOpen('authModal')) return null; // Don't render unless it's needed

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        await register(username, password);
        await login(username, password);
        navigate('/gameMenu');
      } else {
        await login(username, password);
        navigate('/gameMenu');
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
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
  );

  return (
    <ModalWrapper>
      <SVGModal>{modalContent}</SVGModal>
    </ModalWrapper>
  );
};
