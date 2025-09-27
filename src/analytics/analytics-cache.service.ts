import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

export interface CacheConfig {
  key: string;
  ttl: number; // Time to live in seconds
  tags?: string[]; // For cache invalidation
}

@Injectable()
export class AnalyticsCacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Cache Keys Configuration
   * Organized by data type and update frequency
   */
  private static readonly CACHE_CONFIGS = {
    // High frequency - short TTL
    overview: { key: 'overview', ttl: 300 }, // 5 minutes
    users: { key: 'users', ttl: 600 }, // 10 minutes
    activity: { key: 'activity', ttl: 300 }, // 5 minutes
    
    // Medium frequency - medium TTL
    security: { key: 'security', ttl: 1800 }, // 30 minutes
    system: { key: 'system', ttl: 900 }, // 15 minutes
    
    // Low frequency - long TTL
    trends: { key: 'trends', ttl: 3600 }, // 1 hour
    exports: { key: 'exports', ttl: 7200 }, // 2 hours
    status: { key: 'status', ttl: 1800 }, // 30 minutes
  } as const;

  /**
   * Get cached data with intelligent key generation
   */
  async get<T>(
    endpoint: keyof typeof AnalyticsCacheService.CACHE_CONFIGS,
    params?: Record<string, any>
  ): Promise<T | null> {
    const cacheKey = this.generateCacheKey(endpoint, params);
    try {
      const cached = await this.cacheManager.get<T>(cacheKey);
      return cached || null;
    } catch (error) {
      console.error(`Cache get error for key ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Set cached data with configurable TTL
   */
  async set<T>(
    endpoint: keyof typeof AnalyticsCacheService.CACHE_CONFIGS,
    data: T,
    params?: Record<string, any>,
    customTtl?: number
  ): Promise<void> {
    const config = AnalyticsCacheService.CACHE_CONFIGS[endpoint];
    const cacheKey = this.generateCacheKey(endpoint, params);
    const ttl = customTtl || config.ttl;

    try {
      await this.cacheManager.set(cacheKey, data, ttl * 1000); // Convert to milliseconds
    } catch (error) {
      console.error(`Cache set error for key ${cacheKey}:`, error);
    }
  }

  /**
   * Invalidate specific cache entries
   */
  async invalidate(
    endpoint: keyof typeof AnalyticsCacheService.CACHE_CONFIGS,
    params?: Record<string, any>
  ): Promise<void> {
    const cacheKey = this.generateCacheKey(endpoint, params);
    try {
      await this.cacheManager.del(cacheKey);
    } catch (error) {
      console.error(`Cache invalidation error for key ${cacheKey}:`, error);
    }
  }

  /**
   * Invalidate multiple cache entries by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      // Get all keys matching pattern
      const keys = await this.getKeysByPattern(pattern);
      
      // Delete all matching keys
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.cacheManager.del(key)));
      }
    } catch (error) {
      console.error(`Cache pattern invalidation error for pattern ${pattern}:`, error);
    }
  }

  /**
   * Clear all analytics cache
   */
  async clearAll(): Promise<void> {
    try {
      await this.invalidatePattern('analytics:*');
    } catch (error) {
      console.error('Cache clear all error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate: number;
  }> {
    try {
      const keys = await this.getKeysByPattern('analytics:*');
      
      return {
        totalKeys: keys.length,
        memoryUsage: 'N/A', // Redis-specific, would need redis client
        hitRate: 0, // Would need hit/miss tracking
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'Error',
        hitRate: 0,
      };
    }
  }

  /**
   * Cache warming for frequently accessed data
   */
  async warmCache(endpoints: Array<keyof typeof AnalyticsCacheService.CACHE_CONFIGS>): Promise<void> {
    console.log(`Warming cache for endpoints: ${endpoints.join(', ')}`);
    // Implementation would pre-load frequently accessed data
    // This is a placeholder for background job integration
  }

  /**
   * Generate intelligent cache keys with parameter consideration
   */
  private generateCacheKey(
    endpoint: keyof typeof AnalyticsCacheService.CACHE_CONFIGS,
    params?: Record<string, any>
  ): string {
    let key = `analytics:${endpoint}`;
    
    if (params && Object.keys(params).length > 0) {
      // Sort params for consistent key generation
      const sortedParams = Object.keys(params)
        .sort()
        .map(k => `${k}:${params[k]}`)
        .join('|');
      key += `:${sortedParams}`;
    }
    
    return key;
  }

  /**
   * Get keys by pattern (Redis-specific implementation)
   */
  private async getKeysByPattern(pattern: string): Promise<string[]> {
    // This is a simplified version
    // In production, you'd use Redis SCAN command
    try {
      // For now, return empty array as we can't directly access Redis keys through cache-manager
      return [];
    } catch (error) {
      console.error('Get keys by pattern error:', error);
      return [];
    }
  }
}