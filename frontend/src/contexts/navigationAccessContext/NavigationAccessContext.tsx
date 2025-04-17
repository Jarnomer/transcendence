import React, { createContext, useContext, useState } from 'react';

const NavigationAccessContext = createContext<{
  fromAppNavigation: boolean;
  allowInternalNavigation: () => void;
}>({
  fromAppNavigation: false,
  allowInternalNavigation: () => {},
});

export const useNavigationAccess = () => useContext(NavigationAccessContext);

export const NavigationAccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fromAppNavigation, setFromAppNavigation] = useState(false);

  const allowInternalNavigation = () => setFromAppNavigation(true);

  return (
    <NavigationAccessContext.Provider value={{ fromAppNavigation, allowInternalNavigation }}>
      {children}
    </NavigationAccessContext.Provider>
  );
};
