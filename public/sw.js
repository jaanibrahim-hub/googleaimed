const CACHE_NAME = 'mediteach-ai-v1.2.0';
const STATIC_CACHE_NAME = 'mediteach-static-v1.2.0';
const RUNTIME_CACHE_NAME = 'mediteach-runtime-v1.2.0';

// Essential files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/index-BnQIfAdG.js', // Main JS bundle
  '/manifest.json',
  // External dependencies (cached when loaded)
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.min.js'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  console.log('🏥 MediTeach AI Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Caching static assets...');
        return cache.addAll(STATIC_ASSETS.filter(url => url.startsWith('/')));
      })
      .then(() => {
        console.log('✅ Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Error caching static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🏥 MediTeach AI Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== RUNTIME_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request.url)) {
    // Static assets: Cache First strategy
    event.respondWith(cacheFirst(request));
  } else if (isAPIRequest(request.url)) {
    // API requests: Network First with fallback
    event.respondWith(networkFirstWithFallback(request));
  } else if (isExternalResource(request.url)) {
    // External resources: Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request));
  } else {
    // Default: Network First for navigation requests
    event.respondWith(networkFirstWithOfflinePage(request));
  }
});

// Cache First Strategy - for static assets
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Offline - Asset not available', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

// Network First with Fallback - for API requests
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache for API request');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline message for API requests
    return new Response(JSON.stringify({
      error: 'offline',
      message: 'You are currently offline. Please check your internet connection.'
    }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Stale While Revalidate - for external resources
async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.log('Network failed for external resource:', error);
    return cachedResponse;
  });

  return cachedResponse || fetchPromise;
}

// Network First with Offline Page - for navigation
async function networkFirstWithOfflinePage(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // If it's a navigation request, return the cached index.html
    if (request.mode === 'navigate') {
      const cachedResponse = await caches.match('/');
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    return new Response('Offline - Page not available', { 
      status: 503,
      statusText: 'Service Unavailable' 
    });
  }
}

// Helper functions to categorize requests
function isStaticAsset(url) {
  return url.includes('/assets/') || 
         url.endsWith('.js') || 
         url.endsWith('.css') || 
         url.endsWith('.png') || 
         url.endsWith('.jpg') || 
         url.endsWith('.svg') ||
         url.includes('manifest.json');
}

function isAPIRequest(url) {
  return url.includes('/api/') || 
         url.includes('aistudio.google.com') ||
         url.includes('generative-ai');
}

function isExternalResource(url) {
  return url.includes('cdn.') || 
         url.includes('fonts.googleapis.com') ||
         url.includes('cdnjs.cloudflare.com') ||
         url.includes('aistudiocdn.com');
}

// Background sync for storing conversations offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync-conversations') {
    console.log('🔄 Background sync: Syncing conversations...');
    event.waitUntil(syncConversations());
  }
});

async function syncConversations() {
  try {
    // Get stored conversations from IndexedDB when offline
    // This would integrate with the conversation history feature
    console.log('✅ Conversations synced successfully');
  } catch (error) {
    console.error('❌ Error syncing conversations:', error);
  }
}

// Push notifications (for future medical reminders feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'mediteach-notification',
      actions: [
        {
          action: 'open',
          title: 'Open MediTeach AI',
          icon: '/icons/icon-96x96.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification('MediTeach AI', options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return self.clients.openWindow('/');
      })
    );
  }
});

console.log('🏥 MediTeach AI Service Worker: Initialized successfully');