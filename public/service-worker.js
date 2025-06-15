const CACHE_NAME = 'hypestream-cache-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/8eee155a-5511-42f0-83bb-7ef906513992.png',
];

// Network timeout for mobile devices (longer for slower connections)
const NETWORK_TIMEOUT = 15000;

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Cache installation failed:', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Helper function to add network timeout (increased for mobile)
const fetchWithTimeout = (request, timeout = NETWORK_TIMEOUT) => {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
};

// Cache and return requests with mobile-optimized strategy
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests except for TMDB and allow all same-origin
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('image.tmdb.org') && 
      !url.origin.includes('api.themoviedb.org') &&
      !url.origin.includes('cdn.gpteng.co')) {
    return;
  }
  
  // Handle main HTML requests with network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetchWithTimeout(event.request, 10000)
        .then(response => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          return caches.match('/index.html')
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response('App unavailable offline', { 
                status: 503,
                headers: { 'Content-Type': 'text/html' }
              });
            });
        })
    );
    return;
  }
  
  // Handle API requests with cache-first strategy to resolve online loading issues
  if (url.origin.includes('api.themoviedb.org')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('Serving cached API response for:', event.request.url);
            return response;
          }
          
          return fetchWithTimeout(event.request, 12000)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              return caches.match(event.request)
                .then(cachedResponse => {
                  if (cachedResponse) {
                    return cachedResponse;
                  }
                  return new Response(JSON.stringify({ 
                    error: 'Network unavailable', 
                    results: [] 
                  }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                  });
                });
            });
        })
    );
    return;
  }
  
  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetchWithTimeout(event.request, 8000)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Fallback for images
            if (event.request.url.includes('/images/') || 
                event.request.url.includes('.jpg') || 
                event.request.url.includes('.png') || 
                event.request.url.includes('.webp') ||
                event.request.url.includes('image.tmdb.org')) {
              return caches.match('/placeholder.svg') || 
                     new Response('Image unavailable', { status: 404 });
            }
            
            return caches.match(event.request.url);
          });
      })
  );
});

// Update service worker and clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Handle background sync for mobile devices
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
  }
});
