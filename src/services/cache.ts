/**
 * Cache Service
 * 
 * This service provides caching functionality using LocalStorage with TTL support.
 * Implements REQ-NFR-029-D, REQ-NFR-029-E, REQ-NFR-029-F
 */

interface CacheItem<T> {
  value: T;
  expiry: number; // Timestamp in milliseconds
}

class CacheService {
  /**
   * Set cache with TTL (Time To Live)
   * REQ-NFR-029-D, REQ-NFR-029-E: Cache data with expiration
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   */
  set<T>(key: string, value: T, ttl: number): void {
    try {
      const item: CacheItem<T> = {
        value,
        expiry: Date.now() + ttl,
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting cache:', error);
      // Silently fail if localStorage is full or unavailable
    }
  }

  /**
   * Get cache if not expired
   * REQ-NFR-029-D, REQ-NFR-029-E: Retrieve cached data
   * 
   * @param key - Cache key
   * @returns Cached value or null if expired/not found
   */
  get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(itemStr);

      // Check if expired
      if (Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error getting cache:', error);
      return null;
    }
  }

  /**
   * Invalidate specific cache
   * REQ-NFR-029-F: Cache invalidation on operations
   * 
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error invalidating cache:', error);
    }
  }

  /**
   * Invalidate caches matching a pattern
   * REQ-NFR-029-F: Batch cache invalidation
   * 
   * @param pattern - Pattern to match cache keys
   */
  invalidatePattern(pattern: string): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error invalidating cache pattern:', error);
    }
  }

  /**
   * Clear all subgraph-related caches
   * REQ-NFR-029-F: Clear all caches
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('subgraph:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Check if a cache key exists and is not expired
   * 
   * @param key - Cache key
   * @returns true if cache exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }
}

// Export singleton instance
export default new CacheService();

// Export cache key constants for consistency
export const CACHE_KEYS = {
  SUBGRAPH_LIST: 'subgraph:list',
  SUBGRAPH_DETAIL: (id: number) => `subgraph:detail:${id}`,
  SUBGRAPH_TOPOLOGY: (id: number) => `subgraph:topology:${id}`,
  SUBGRAPH_RESOURCES: (id: number) => `subgraph:resources:${id}`,
  SUBGRAPH_PERMISSIONS: (id: number) => `subgraph:permissions:${id}`,
  USER_PREFERENCES: 'subgraph:preferences',
} as const;

// Export TTL constants (in milliseconds)
export const CACHE_TTL = {
  LIST: 5 * 60 * 1000, // 5 minutes
  DETAIL: 2 * 60 * 1000, // 2 minutes
  TOPOLOGY: 2 * 60 * 1000, // 2 minutes
  RESOURCES: 2 * 60 * 1000, // 2 minutes
  PERMISSIONS: 2 * 60 * 1000, // 2 minutes
} as const;
