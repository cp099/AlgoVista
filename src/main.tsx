import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from '@core/ThemeContext';
import { SettingsProvider } from '@core/SettingsContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>,
);