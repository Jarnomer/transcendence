import React, { createContext, ReactNode, useContext, useState } from 'react';

interface LoadingContextType {
  loadingStates: {
    matchMakingAnimationLoading: boolean;
    scoreBoardLoading: boolean;
  };
  setLoadingState: (key: string, state: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState({
    matchMakingAnimationLoading: true,
    scoreBoardLoading: true,
  });

  const setLoadingState = (key: string, state: boolean) => {
    setLoadingStates((prevState) => ({
      ...prevState,
      [key]: state,
    }));
  };

  return (
    <LoadingContext.Provider value={{ loadingStates, setLoadingState }}>
      {children}
    </LoadingContext.Provider>
  );
};
