import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialize analytics tracking
import { analytics } from './services/analyticsService';

// Initialize offline API client
import { api } from './lib/offlineApi';

// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully:', registration.scope);

        // Setup periodic sync for cache cleanup
        if ('periodicSync' in registration) {
          registration.periodicSync.register('cache-cleanup', {
            minInterval: 24 * 60 * 60 * 1000 // 24 hours
          }).catch(console.error);
        }
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}

// Setup offline sync when connection is restored
api.setupOfflineSync();

createRoot(document.getElementById("root")!).render(<App />);
