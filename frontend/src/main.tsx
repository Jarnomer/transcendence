import { BrowserRouter as Router } from 'react-router-dom';

import ReactDOM from 'react-dom/client';

import { LoadingProvider } from '@/contexts/gameContext/LoadingContextProvider';

import App from './app';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { ChatProvider } from './contexts/chatContext/ChatContext';
import { ModalProvider } from './contexts/modalContext/ModalContext';
import { UserProvider } from './contexts/user/UserContext';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>

  <UserProvider>
    <WebSocketProvider>
      <ModalProvider>
        <ChatProvider>
          <LoadingProvider>
            <Router>
              <App />
            </Router>
          </LoadingProvider>
        </ChatProvider>
      </ModalProvider>
    </WebSocketProvider>
  </UserProvider>
  //</React.StrictMode>,
);
