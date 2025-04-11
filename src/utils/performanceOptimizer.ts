
/**
 * Performance Optimizer
 * 
 * This utility provides methods for improving application performance and reducing
 * loading times. It implements techniques like:
 * - Image optimization and lazy loading
 * - Script loading prioritization
 * - Network request batching
 * - Browser cache management
 */

// --------------- Image Optimization ---------------

/**
 * Determines the optimal image size based on the container size and device DPR
 */
export const getOptimalImageSize = (containerWidth: number): string => {
  const dpr = window.devicePixelRatio || 1;
  const targetWidth = Math.round(containerWidth * dpr);
  
  // Common image size breakpoints
  const sizes = [300, 600, 900, 1200, 1800, 2400];
  
  // Find the smallest size that's still larger than our target
  for (const size of sizes) {
    if (size >= targetWidth) {
      return `${size}`;
    }
  }
  
  // Default to the largest size if needed
  return `${sizes[sizes.length - 1]}`;
};

/**
 * Preloads critical images
 */
export const preloadCriticalImages = (urls: string[]): void => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

// --------------- Network Optimization ---------------

/**
 * Batches multiple fetch requests to reduce network overhead
 */
export const batchRequests = async <T>(
  urls: string[],
  options?: RequestInit
): Promise<T[]> => {
  // Use Promise.all to make concurrent requests
  return Promise.all(
    urls.map(url =>
      fetch(url, options)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json() as Promise<T>;
        })
    )
  );
};

// Cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Makes a fetch request with caching
 */
export const fetchWithCache = async <T>(
  url: string,
  options?: RequestInit,
  bypassCache = false
): Promise<T> => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const now = Date.now();
  
  // Check for a valid cached response
  if (!bypassCache && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get(cacheKey)!;
    if (now - cachedData.timestamp < CACHE_DURATION) {
      console.log('Using cached data for:', url);
      return cachedData.data as T;
    }
  }
  
  // Fetch new data
  console.log('Fetching fresh data for:', url);
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  apiCache.set(cacheKey, {
    data,
    timestamp: now
  });
  
  return data as T;
};

// --------------- Script Optimization ---------------

/**
 * Loads JavaScript resources with proper prioritization
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
    
    // Set the fetchpriority attribute for browsers that support it
    if ('fetchPriority' in HTMLImageElement.prototype) {
      (script as any).fetchPriority = priority;
    }
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    
    document.head.appendChild(script);
  });
};

// --------------- Resource Hints ---------------

/**
 * Adds DNS prefetch for external domains
 */
export const addDnsPrefetch = (domains: string[]): void => {
  domains.forEach(domain => {
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
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    if (crossOrigin) {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};

// --------------- Init Function ---------------

/**
 * Initialize performance optimizations
 */
export const initPerformanceOptimizations = (): void => {
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
  
  // Preload critical assets
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
    
    longTaskObserver.observe({ entryTypes: ['longtask'] });
  }
  
  console.log('Performance optimizations initialized');
};
