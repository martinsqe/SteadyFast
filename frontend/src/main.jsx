import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { registerSW } from 'virtual:pwa-register';

// Register the service worker.
// When a new SW version finishes installing and is waiting to activate,
// fire a custom event so PWAInstallPrompt can show the "Update available" toast.
registerSW({
  immediate: true,
  onNeedRefresh() {
    window.dispatchEvent(new Event('pwa-update'));
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work offline.');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);
