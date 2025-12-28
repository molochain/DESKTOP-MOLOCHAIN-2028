// MOLOCHAIN Platform Service Worker - Enhanced PWA Implementation
const CACHE_NAME = 'molochain-v3.0';
const STATIC_CACHE = 'molochain-static-v3.0';
const DYNAMIC_CACHE = 'molochain-dynamic-v3.0';
const API_CACHE = 'molochain-api-v3.0';

// Critical resources for offline functionality
const urlsToCache = [
  '/',
  '/offline.html',
  '/molochain-logo.png',
  '/container-aerial.jpg',
  '/api/health',
  '/api/services',
  '/manifest.json'
];

// API endpoints to cache for offline functionality
const apiEndpointsToCache = [
  '/api/health',
  '/api/services',
  '/api/health/detailed',
  '/api/auth/me'
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(urlsToCache);
      }),
      caches.open(API_CACHE).then((cache) => {
        console.log('Service Worker: Pre-caching API endpoints');
        return Promise.all(
          apiEndpointsToCache.map(url => 
            fetch(url).then(response => {
              if (response.ok) {
                return cache.put(url, response.clone());
              }
            }).catch(() => {
              // Silently handle network errors during install
            })
          )
        );
      })
    ])
  );
  
  // Force activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== API_CACHE &&
              cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement sophisticated caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }
  
  // Skip WebSocket upgrade requests
  if (request.headers.get('upgrade') === 'websocket') {
    return;
  }
  
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // API requests - Cache First with Network Fallback
  if (url.pathname.startsWith('/api/')) {
    return handleApiRequest(request);
  }
  
  // Static assets - Cache First
  if (isStaticAsset(url.pathname)) {
    return handleStaticAsset(request);
  }
  
  // HTML pages - Network First with Cache Fallback
  if (request.mode === 'navigate') {
    return handleNavigation(request);
  }
  
  // Default strategy - Network First
  return handleDefault(request);
}

async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  // Health endpoints - always try network first for fresh data
  if (url.pathname.includes('/health')) {
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        const cache = await caches.open(API_CACHE);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      }
    } catch (error) {
      console.log('Service Worker: Network failed for health endpoint, serving cache');
    }
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({
      status: 'offline',
      message: 'Health check unavailable offline'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Other API requests - Cache First for better offline experience
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Update cache in background
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Network unavailable',
      message: 'This feature requires an internet connection'
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback for images
    if (request.url.includes('.jpg') || request.url.includes('.png')) {
      return caches.match('/molochain-logo.png');
    }
    throw error;
  }
}

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed for navigation, serving cache or offline page');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return caches.match('/offline.html') || new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>MOLOCHAIN - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline-container { max-width: 500px; margin: 0 auto; }
            .logo { width: 100px; height: 100px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <img src="/molochain-logo.png" alt="MOLOCHAIN" class="logo">
            <h1>You're Offline</h1>
            <p>Please check your internet connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

async function handleDefault(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

async function updateCacheInBackground(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
  } catch (error) {
    // Silently handle background update failures
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processOfflineActions());
  }
});

async function processOfflineActions() {
  // Process any queued offline actions
  console.log('Service Worker: Processing offline actions');
  
  // Implementation for handling offline form submissions, etc.
  // This would integrate with IndexedDB to store offline actions
}

// Push notification handling
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New update from MOLOCHAIN',
      icon: '/molochain-logo.png',
      badge: '/molochain-logo.png',
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'MOLOCHAIN', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_UPDATE') {
    event.waitUntil(updateCache());
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function updateCache() {
  const cache = await caches.open(STATIC_CACHE);
  return cache.addAll(urlsToCache);
}