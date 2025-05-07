import ReactDOM from 'react-dom/client';

import {
  ChatProvider,
  ModalProvider,
  NavigationAccessProvider,
  UserProvider,
  WebSocketProvider,
} from '@contexts';

import App from './app';

import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
  <UserProvider>
    <WebSocketProvider>
      <ChatProvider>
        <ModalProvider>
          <NavigationAccessProvider>
            <App />
          </NavigationAccessProvider>
        </ModalProvider>
      </ChatProvider>
    </WebSocketProvider>
  </UserProvider>
  //</React.StrictMode>,
);
