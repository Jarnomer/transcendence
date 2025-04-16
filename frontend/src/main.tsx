import { BrowserRouter as Router } from 'react-router-dom';

import ReactDOM from 'react-dom/client';

import { LoadingProvider } from '@/contexts/gameContext/LoadingContextProvider';

import App from './app';
import { ModalProvider } from './contexts/modalContext/ModalContext';
import { NavigationAccessProvider } from './contexts/navigationAccessContext/NavigationAccessContext';
import { UserProvider } from './contexts/user/UserContext';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>

  <UserProvider>
    <ModalProvider>
      <LoadingProvider>
        <NavigationAccessProvider>
          <Router>
            <App />
          </Router>
        </NavigationAccessProvider>
      </LoadingProvider>
    </ModalProvider>
  </UserProvider>
  //</React.StrictMode>,
);
