import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { SoundProvider } from './hooks/useGameSounds';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SoundProvider>
      <App />
    </SoundProvider>
  </React.StrictMode>
);