import { BrowserRouter as Router } from 'react-router-dom';

import ReactDOM from 'react-dom/client';

import { LoadingProvider } from '@/contexts/gameContext/LoadingContextProvider';

import App from './app';
import { UserProvider } from './contexts/user/UserContext';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>

  <UserProvider>
    <LoadingProvider>
      <Router>
        <App />
      </Router>
    </LoadingProvider>
  </UserProvider>
  //</React.StrictMode>,
);
