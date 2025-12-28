const CACHE_NAME = 'molochain-v2.1';
const STATIC_CACHE = 'molochain-static-v2.1';
const API_CACHE = 'molochain-api-v2.1';
const IMAGE_CACHE = 'molochain-images-v2.1';

const urlsToCache = [
  '/',
  '/molochain-logo.png',
  '/container-aerial.jpg',
  '/api/health',
  '/offline.html',
  '/manifest.json'
];

const apiEndpoints = [
  '/api/services',
  '/api/regions', 
  '/api/products',
  '/api/partners',
  '/api/analytics/delivery-performance'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Caching application files
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error('Service worker install error:', error);
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            // Clearing old cache
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response for caching
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successfully synced action
        await removePendingAction(action.id);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.log('Background sync failed for action:', action.id);
        }
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.log('Background sync error:', error);
    }
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      timestamp: Date.now(),
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View Details'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('MoloChain', options)
  );
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

// Helper functions for IndexedDB operations
async function getPendingActions() {
  try {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MoloChainOffline', 1);
      
      request.onerror = () => {
        if (import.meta.env.DEV) {
          console.error('IndexedDB open error:', request.error);
        }
        resolve([]);
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['pendingActions'], 'readonly');
        const store = transaction.objectStore('pendingActions');
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => resolve(getAllRequest.result);
        getAllRequest.onerror = () => {
          if (import.meta.env.DEV) {
            console.error('IndexedDB getAll error:', getAllRequest.error);
          }
          resolve([]);
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('pendingActions')) {
          db.createObjectStore('pendingActions', { keyPath: 'id' });
        }
      };
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('getPendingActions error:', error);
    }
    return [];
  }
}

async function removePendingAction(id) {
  try {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MoloChainOffline', 1);
      
      request.onerror = () => {
        if (import.meta.env.DEV) {
          console.error('IndexedDB open error:', request.error);
        }
        resolve(false);
      };
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['pendingActions'], 'readwrite');
        const store = transaction.objectStore('pendingActions');
        const deleteRequest = store.delete(id);
        
        deleteRequest.onsuccess = () => resolve(true);
        deleteRequest.onerror = () => {
          if (import.meta.env.DEV) {
            console.error('IndexedDB delete error:', deleteRequest.error);
          }
          resolve(false);
        };
      };
    });
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('removePendingAction error:', error);
    }
    return false;
  }
}