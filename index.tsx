import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Corrected import path to be explicit.
import App from './App.tsx';
import { ThemeProvider } from './components/ThemeProvider.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);