
const CACHE_NAME = 'hypestream-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/lovable-uploads/8eee155a-5511-42f0-83bb-7ef906513992.png',
];

// Install a service worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin) || 
      event.request.url.includes('image.tmdb.org')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          
          // Clone the request because it's a one-time use stream
          const fetchRequest = event.request.clone();
          
          return fetch(fetchRequest).then(response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              // Don't cache non-success responses or non-basic type responses
              // But still return the response for API calls etc.
              if (response && response.url && 
                  (response.url.includes('api.themoviedb.org') || 
                   response.url.includes('youtube.com'))) {
                return response;
              }
              
              return response;
            }
            
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API responses that might change frequently
                if (!event.request.url.includes('api.themoviedb.org')) {
                  cache.put(event.request, responseToCache);
                }
              });
            
            return response;
          });
        })
        .catch(() => {
          // If both cache and network fail, return a fallback
          if (event.request.url.includes('/images/') || event.request.url.includes('.jpg') || 
              event.request.url.includes('.png') || event.request.url.includes('.webp')) {
            return caches.match('/placeholder.svg');
          }
        })
    );
  }
});

// Update a service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
