import { BrowserRouter as Router } from 'react-router-dom';

import ReactDOM from 'react-dom/client';

import { LoadingProvider } from '@/contexts/gameContext/LoadingContextProvider';
import App from './app';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
  <LoadingProvider>
    <Router>
      <App />
    </Router>
  </LoadingProvider>
  //</React.StrictMode>,
);
