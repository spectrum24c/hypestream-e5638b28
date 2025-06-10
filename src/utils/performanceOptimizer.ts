
/**
 * Performance Optimizer
 * 
 * This utility provides methods for improving application performance and reducing
 * loading times, especially for bad network conditions. It implements techniques like:
 * - Image optimization and lazy loading
 * - Script loading prioritization
 * - Network request batching and retry logic
 * - Browser cache management
 * - Connection quality detection
 */

// --------------- Network Quality Detection ---------------

/**
 * Detects network connection quality
 */
export const getNetworkQuality = (): 'slow' | 'fast' => {
  // Check if Network Information API is available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    // Consider slow: 2G, slow-2g, or effective type is slow-2g/2g
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'slow';
    }
    
    // Consider slow if downlink is very low
    if (connection.downlink && connection.downlink < 1.5) {
      return 'slow';
    }
  }
  
  return 'fast';
};

// --------------- Image Optimization ---------------

/**
 * Determines the optimal image size based on the container size, device DPR, and network quality
 */
export const getOptimalImageSize = (containerWidth: number): string => {
  const dpr = window.devicePixelRatio || 1;
  const networkQuality = getNetworkQuality();
  
  // Reduce image quality for slow networks
  const qualityMultiplier = networkQuality === 'slow' ? 0.7 : 1;
  const targetWidth = Math.round(containerWidth * dpr * qualityMultiplier);
  
  // Common image size breakpoints
  const sizes = [300, 600, 900, 1200, 1800, 2400];
  
  // For slow networks, cap at smaller sizes
  const maxSize = networkQuality === 'slow' ? 900 : 2400;
  
  // Find the smallest size that's still larger than our target
  for (const size of sizes) {
    if (size >= targetWidth && size <= maxSize) {
      return `${size}`;
    }
  }
  
  // Default to appropriate size based on network
  return networkQuality === 'slow' ? '600' : `${sizes[sizes.length - 1]}`;
};

/**
 * Preloads critical images with network-aware prioritization
 */
export const preloadCriticalImages = (urls: string[]): void => {
  const networkQuality = getNetworkQuality();
  
  // Limit preloading on slow networks
  const maxPreloads = networkQuality === 'slow' ? 2 : urls.length;
  
  urls.slice(0, maxPreloads).forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    
    // Set fetchpriority for modern browsers
    if ('fetchPriority' in HTMLImageElement.prototype) {
      (link as any).fetchPriority = networkQuality === 'slow' ? 'low' : 'high';
    }
    
    document.head.appendChild(link);
  });
};

// --------------- Network Optimization ---------------

/**
 * Retry mechanism for failed requests
 */
const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Request failed, retrying in ${delay}ms. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2); // Exponential backoff
    }
    throw error;
  }
};

/**
 * Batches multiple fetch requests to reduce network overhead with retry logic
 */
export const batchRequests = async <T>(
  urls: string[],
  options?: RequestInit
): Promise<T[]> => {
  const networkQuality = getNetworkQuality();
  const maxConcurrent = networkQuality === 'slow' ? 2 : 6;
  const retries = networkQuality === 'slow' ? 5 : 3;
  
  // Process requests in batches to avoid overwhelming slow connections
  const results: T[] = [];
  
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(url =>
      retryRequest(
        () => fetch(url, options).then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json() as Promise<T>;
        }),
        retries
      )
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
};

// Cache for API responses with network-aware TTL
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Makes a fetch request with caching and network-aware TTL
 */
export const fetchWithCache = async <T>(
  url: string,
  options?: RequestInit,
  bypassCache = false
): Promise<T> => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const now = Date.now();
  const networkQuality = getNetworkQuality();
  
  // Longer cache duration for slow networks
  const CACHE_DURATION = networkQuality === 'slow' ? 15 * 60 * 1000 : 5 * 60 * 1000; // 15 min vs 5 min
  
  // Check for a valid cached response
  if (!bypassCache && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get(cacheKey)!;
    if (now - cachedData.timestamp < cachedData.ttl) {
      console.log('Using cached data for:', url);
      return cachedData.data as T;
    }
  }
  
  // Fetch new data with retry logic
  console.log('Fetching fresh data for:', url);
  const retries = networkQuality === 'slow' ? 5 : 3;
  
  const data = await retryRequest(async () => {
    const response = await fetch(url, {
      ...options,
      // Add timeout for slow networks
      signal: AbortSignal.timeout(networkQuality === 'slow' ? 30000 : 15000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  }, retries);
  
  // Cache the response with network-aware TTL
  apiCache.set(cacheKey, {
    data,
    timestamp: now,
    ttl: CACHE_DURATION
  });
  
  return data as T;
};

// --------------- Script Optimization ---------------

/**
 * Loads JavaScript resources with proper prioritization and network awareness
 */
export const loadScript = (
  src: string,
  async = true,
  defer = true,
  priority = 'low'
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = async;
    script.defer = defer;
    
    const networkQuality = getNetworkQuality();
    
    // Set the fetchpriority attribute for browsers that support it
    if ('fetchPriority' in HTMLImageElement.prototype) {
      (script as any).fetchPriority = networkQuality === 'slow' ? 'low' : priority;
    }
    
    // Add timeout for slow networks
    const timeout = setTimeout(() => {
      reject(new Error(`Script load timeout: ${src}`));
    }, networkQuality === 'slow' ? 30000 : 15000);
    
    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(`Failed to load script: ${src}`));
    };
    
    document.head.appendChild(script);
  });
};

// --------------- Resource Hints ---------------

/**
 * Adds DNS prefetch for external domains with network awareness
 */
export const addDnsPrefetch = (domains: string[]): void => {
  const networkQuality = getNetworkQuality();
  
  // Limit DNS prefetches on slow networks
  const maxPrefetches = networkQuality === 'slow' ? 2 : domains.length;
  
  domains.slice(0, maxPrefetches).forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

/**
 * Adds preconnect hints for important external resources
 */
export const addPreconnect = (urls: string[], crossOrigin = true): void => {
  const networkQuality = getNetworkQuality();
  
  // Limit preconnects on slow networks
  const maxPreconnects = networkQuality === 'slow' ? 2 : urls.length;
  
  urls.slice(0, maxPreconnects).forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    if (crossOrigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// --------------- Service Worker Communication ---------------

/**
 * Registers service worker with cache strategies for offline support
 */
export const registerServiceWorker = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        console.log('Service Worker update available');
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// --------------- Init Function ---------------

/**
 * Initialize performance optimizations with network awareness
 */
export const initPerformanceOptimizations = (): void => {
  const networkQuality = getNetworkQuality();
  
  console.log(`Network quality detected: ${networkQuality}`);
  
  // Add DNS prefetch for common external domains
  addDnsPrefetch([
    'https://image.tmdb.org',
    'https://api.themoviedb.org',
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]);
  
  // Add preconnect hints
  addPreconnect([
    'https://image.tmdb.org',
    'https://api.themoviedb.org'
  ]);
  
  // Register service worker for offline support
  registerServiceWorker();
  
  // Preload critical assets (reduced for slow networks)
  preloadCriticalImages([
    // Add paths to critical hero images or logos
  ]);
  
  // Register performance observer to monitor long tasks
  if ('PerformanceObserver' in window) {
    const longTaskObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        console.warn('Long task detected:', entry.duration, 'ms');
      });
    });
    
    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.warn('Long task observer not supported');
    }
  }
  
  console.log(`Performance optimizations initialized for ${networkQuality} network`);
};
