/**
 * Service Worker for Anand Saathi
 * Provides offline functionality and caching for better performance
 */

const CACHE_NAME = 'anand-saathi-v2';
const API_CACHE_NAME = 'anand-saathi-api-v1';
const OFFLINE_URL = '/offline.html';

// Resources to cache immediately
const PRECACHE_RESOURCES = [
  '/',
  '/offline.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/field',
  '/api/weather',
  '/api/predictions',
  '/api/analytics'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching app resources...');
        return cache.addAll(PRECACHE_RESOURCES);
      }),
      caches.open(API_CACHE_NAME).then((cache) => {
        console.log('API cache ready');
      })
    ])
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients
  self.clients.claim();
});

// Fetch event - serve cached content and handle API requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static resources
  if (request.destination === 'document' ||
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image') {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
});

// Handle API requests with caching and offline support
async function handleApiRequest(request) {
  try {
    // Try network first for fresh data
    if (navigator.onLine) {
      const networkResponse = await fetch(request.clone());

      if (networkResponse.ok) {
        // Cache successful responses
        const cache = await caches.open(API_CACHE_NAME);
        cache.put(request, networkResponse.clone());
      }

      return networkResponse;
    }

    // If offline, return cached response
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // No cached response available
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This feature requires internet connection',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('API request failed:', error);

    // Return cached response as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(
      JSON.stringify({
        error: 'Network Error',
        message: 'Unable to fetch data'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static resource requests
async function handleStaticRequest(request) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Static request failed:', error);

    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Resource not available', { status: 404 });
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      return networkResponse;
    }
  } catch (error) {
    // Network failed, serve offline page or cached index
  }

  // Try to serve cached index page
  const cachedIndex = await caches.match('/');
  if (cachedIndex) {
    return cachedIndex;
  }

  // Serve offline page as last resort
  return caches.match(OFFLINE_URL) || new Response('Offline', { status: 503 });
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);

  if (event.tag === 'anand-saathi-sync') {
    event.waitUntil(syncOfflineActions());
  }
});

// Sync offline actions when connection is restored
async function syncOfflineActions() {
  try {
    console.log('Starting offline actions sync...');

    // Get offline actions from IndexedDB (would need to implement this)
    const offlineActions = await getOfflineActions();

    for (const action of offlineActions) {
      try {
        console.log(`Syncing action: ${action.method} ${action.url}`);

        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });

        if (response.ok) {
          // Remove from offline storage after successful sync
          await removeOfflineAction(action.id);
          console.log(`✅ Synced action ${action.id}`);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error(`❌ Failed to sync action ${action.id}:`, error);

        // Increment retry count or handle failure
        if (action.retryCount < 3) {
          action.retryCount++;
          await updateOfflineAction(action);
        } else {
          console.error(`🗑️ Discarding action ${action.id} after max retries`);
          await removeOfflineAction(action.id);
        }
      }
    }

    console.log('✅ Offline sync completed');
  } catch (error) {
    console.error('❌ Offline sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations (would need actual implementation)
async function getOfflineActions() {
  // This would query IndexedDB for pending actions
  return [];
}

async function removeOfflineAction(id) {
  // This would remove the action from IndexedDB
}

async function updateOfflineAction(action) {
  // This would update the action in IndexedDB
}

// Handle push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/badge-icon.png',
      tag: data.tag || 'anand-saathi-notification',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || []
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action) {
    // Handle action buttons
    console.log('Notification action clicked:', event.action);
  } else {
    // Handle notification body click
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Periodic background sync for cache cleanup
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupOldCache());
  }
});

async function cleanupOldCache() {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();

    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const date = response.headers.get('date');
        if (date) {
          const responseTime = new Date(date).getTime();
          if (now - responseTime > maxAge) {
            await cache.delete(request);
            console.log('Cleaned old cache entry:', request.url);
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}
