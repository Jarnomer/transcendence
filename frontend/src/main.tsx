import { BrowserRouter as Router } from 'react-router-dom';

import ReactDOM from 'react-dom/client';

import App from './app';
import './style.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
  <Router>
    <App />
  </Router>
  //</React.StrictMode>,
);
