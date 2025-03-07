import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './style.css';
import { WebSocketProvider } from './services/WebSocketContext';
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebSocketProvider>
      <Router>
        <App />
      </Router>
    </WebSocketProvider>
  </React.StrictMode>,
);
