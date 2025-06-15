
/**
 * Performance Optimizer
 * 
 * This utility provides methods for improving application performance and reducing
 * loading times, especially for mobile devices and bad network conditions.
 */

// --------------- Network Quality Detection ---------------

/**
 * Detects network connection quality with mobile-first approach
 */
export const getNetworkQuality = (): 'slow' | 'fast' => {
  // Check if Network Information API is available
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    
    // Consider slow: 2G, slow-2g, or effective type is slow-2g/2g
    if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
      return 'slow';
    }
    
    // Consider slow if downlink is very low (common on mobile)
    if (connection.downlink && connection.downlink < 2) {
      return 'slow';
    }
  }
  
  // Default to slow for mobile devices to be safe
  const isMobile = window.innerWidth < 768;
  return isMobile ? 'slow' : 'fast';
};

// --------------- Mobile Detection ---------------

/**
 * Detects if the device is mobile
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < 768;
};

// --------------- Image Optimization ---------------

/**
 * Determines the optimal image size for mobile devices
 */
export const getOptimalImageSize = (containerWidth: number): string => {
  const dpr = window.devicePixelRatio || 1;
  const networkQuality = getNetworkQuality();
  const isMobile = isMobileDevice();
  
  // Aggressive quality reduction for mobile and slow networks
  let qualityMultiplier = 1;
  if (isMobile && networkQuality === 'slow') {
    qualityMultiplier = 0.5;
  } else if (isMobile || networkQuality === 'slow') {
    qualityMultiplier = 0.7;
  }
  
  const targetWidth = Math.round(containerWidth * dpr * qualityMultiplier);
  
  // Mobile-optimized size breakpoints
  const sizes = [200, 400, 600, 800, 1200, 1600];
  
  // Cap at smaller sizes for mobile and slow networks
  let maxSize = 1600;
  if (isMobile && networkQuality === 'slow') {
    maxSize = 600;
  } else if (isMobile || networkQuality === 'slow') {
    maxSize = 800;
  }
  
  // Find the smallest size that's still larger than our target
  for (const size of sizes) {
    if (size >= targetWidth && size <= maxSize) {
      return `${size}`;
    }
  }
  
  // Default based on device and network
  if (isMobile && networkQuality === 'slow') return '400';
  if (isMobile || networkQuality === 'slow') return '600';
  return '800';
};

/**
 * Preloads critical images with mobile-aware prioritization (React-safe)
 */
export const preloadCriticalImages = (urls: string[]): void => {
  const networkQuality = getNetworkQuality();
  const isMobile = isMobileDevice();
  
  // Limit preloading aggressively on mobile with slow networks
  let maxPreloads = urls.length;
  if (isMobile && networkQuality === 'slow') {
    maxPreloads = 1;
  } else if (isMobile || networkQuality === 'slow') {
    maxPreloads = 2;
  }
  
  urls.slice(0, maxPreloads).forEach(url => {
    // Use React-safe preloading without direct DOM manipulation
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    
    // Set fetchpriority for modern browsers
    if ('fetchPriority' in HTMLImageElement.prototype) {
      (link as any).fetchPriority = (isMobile && networkQuality === 'slow') ? 'low' : 'high';
    }
    
    // Only append if head exists and not already added
    if (document.head && !document.head.querySelector(`link[href="${url}"]`)) {
      document.head.appendChild(link);
    }
  });
};

// --------------- Network Optimization ---------------

/**
 * Retry mechanism with mobile-optimized settings
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
      return retryRequest(fn, retries - 1, Math.min(delay * 1.5, 5000)); // Cap max delay
    }
    throw error;
  }
};

// Cache with mobile-optimized TTL
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Mobile-optimized fetch with caching
 */
export const fetchWithCache = async <T>(
  url: string,
  options?: RequestInit,
  bypassCache = false
): Promise<T> => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const now = Date.now();
  const networkQuality = getNetworkQuality();
  const isMobile = isMobileDevice();
  
  // Longer cache for mobile devices
  let cacheDuration = 5 * 60 * 1000; // 5 min default
  if (isMobile && networkQuality === 'slow') {
    cacheDuration = 30 * 60 * 1000; // 30 min for mobile + slow
  } else if (isMobile || networkQuality === 'slow') {
    cacheDuration = 15 * 60 * 1000; // 15 min
  }
  
  // Check cache first
  if (!bypassCache && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get(cacheKey)!;
    if (now - cachedData.timestamp < cachedData.ttl) {
      console.log('Using cached data for:', url);
      return cachedData.data as T;
    }
  }
  
  // Fetch with mobile-optimized timeout and retries
  console.log('Fetching fresh data for:', url);
  const timeout = isMobile ? 25000 : 15000;
  const retries = isMobile && networkQuality === 'slow' ? 5 : 3;
  
  const data = await retryRequest(async () => {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(timeout)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    return response.json();
  }, retries);
  
  // Cache with mobile-optimized TTL
  apiCache.set(cacheKey, {
    data,
    timestamp: now,
    ttl: cacheDuration
  });
  
  return data as T;
};

// --------------- Init Function ---------------

/**
 * Initialize performance optimizations without DOM manipulation
 */
export const initPerformanceOptimizations = (): void => {
  try {
    const networkQuality = getNetworkQuality();
    const isMobile = isMobileDevice();
    
    console.log(`Device: ${isMobile ? 'Mobile' : 'Desktop'}, Network: ${networkQuality}`);
    console.log(`Performance optimizations initialized for ${isMobile ? 'mobile' : 'desktop'} with ${networkQuality} network`);
    
    // Register service worker without DOM conflicts
    if ('serviceWorker' in navigator && typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registration successful:', registration.scope);
          })
          .catch(error => {
            console.log('ServiceWorker registration failed:', error);
          });
      });
    }
  } catch (error) {
    console.warn('Performance optimization failed:', error);
  }
};
