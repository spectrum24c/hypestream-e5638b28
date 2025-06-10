
const CACHE_NAME = 'hypestream-cache-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/8eee155a-5511-42f0-83bb-7ef906513992.png',
];

// Network timeout for slow connections
const NETWORK_TIMEOUT = 8000;

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

// Helper function to add network timeout
const fetchWithTimeout = (request, timeout = NETWORK_TIMEOUT) => {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
};

// Cache and return requests with network-first strategy for API calls
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests except for TMDB
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('image.tmdb.org') && 
      !url.origin.includes('api.themoviedb.org')) {
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.origin.includes('api.themoviedb.org')) {
    event.respondWith(
      fetchWithTimeout(event.request)
        .then(response => {
          // Clone and cache successful API responses
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
          // Fallback to cache if network fails
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('Serving cached API response for:', event.request.url);
                return cachedResponse;
              }
              // Return a basic error response for API calls
              return new Response(JSON.stringify({ 
                error: 'Network unavailable', 
                results: [] 
              }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            });
        })
    );
    return;
  }
  
  // Handle image and static assets with cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Try network with timeout
        return fetchWithTimeout(event.request)
          .then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response because it's a one-time use stream
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
            
            // For other requests, try to return any cached version
            return caches.match(event.request.url);
          });
      })
  );
});

// Update a service worker and clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    Promise.all([
      // Clean up old caches
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
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Handle background sync for failed requests (if supported)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    // Handle any queued requests here
  }
});
