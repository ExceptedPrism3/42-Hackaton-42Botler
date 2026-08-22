import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

const getBasename = () => {
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/42botler')) {
    return '/42botler';
  }
  return '';
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={getBasename()}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
