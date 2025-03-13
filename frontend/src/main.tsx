import { BrowserRouter as Router } from 'react-router-dom';

import ReactDOM from 'react-dom/client';

import App from './app';
import { LoadingProvider } from './pages/LoadingContextProvider';
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
