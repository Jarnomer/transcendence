import ReactDOM from 'react-dom/client';

import { LoadingProvider } from '@/contexts/gameContext/LoadingContextProvider';

import App from './app';
import { ModalProvider } from './contexts/modalContext/ModalContext';
import BackgroundMusicManager from './contexts/Music/BackgroundMusicManager';
import { NavigationAccessProvider } from './contexts/navigationAccessContext/NavigationAccessContext';
import { UserProvider } from './contexts/user/UserContext';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>

  <UserProvider>
    <ModalProvider>
      <LoadingProvider>
        <NavigationAccessProvider>
          <BackgroundMusicManager>
            <App />
          </BackgroundMusicManager>
        </NavigationAccessProvider>
      </LoadingProvider>
    </ModalProvider>
  </UserProvider>
  //</React.StrictMode>,
);
