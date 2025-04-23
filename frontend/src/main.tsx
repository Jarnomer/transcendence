import ReactDOM from 'react-dom/client';

import { LoadingProvider } from '@/contexts/gameContext/LoadingContextProvider';

import App from './app';
import { ChatProvider } from './contexts/chatContext/ChatContext';
import { ModalProvider } from './contexts/modalContext/ModalContext';
import { NavigationAccessProvider } from './contexts/navigationAccessContext/NavigationAccessContext';
import { UserProvider } from './contexts/user/UserContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>

  <UserProvider>
    <WebSocketProvider>
      <ChatProvider>
        <ModalProvider>
          <LoadingProvider>
            <NavigationAccessProvider>
              <App />
            </NavigationAccessProvider>
          </LoadingProvider>
        </ModalProvider>
      </ChatProvider>
    </WebSocketProvider>
  </UserProvider>
  //</React.StrictMode>,
);
