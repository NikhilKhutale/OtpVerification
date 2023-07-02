import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthContextProvider } from './context/authContext.js';
import App from './App';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorPage from './pages/ErrorPage.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary fallback={<ErrorPage />}>
      <AuthContextProvider>
        <App />
      </AuthContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);