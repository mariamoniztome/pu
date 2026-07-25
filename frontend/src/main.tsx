import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n/config';
import { applyCachedThemeSync } from './lib/theme/applyTheme';

// Re-apply the last org theme before first paint — org branding only arrives
// after /auth/me resolves, which would otherwise flash default colors.
applyCachedThemeSync();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
