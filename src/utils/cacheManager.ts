// 缓存管理工具
import * as THREE from 'three';

// 缓存类型定义
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

// 缓存管理器类
export class CacheManager {
  private static instance: CacheManager;
  private memoryCache = new Map<string, CacheItem<any>>();
  private textureCache = new Map<string, THREE.Texture>();
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  private materialCache = new Map<string, THREE.Material>();
  private maxMemoryCacheSize = 100; // 最大缓存项数
  private defaultExpiry = 30 * 60 * 1000; // 30分钟默认过期时间

  private constructor() {
    // 定期清理过期缓存
    setInterval(() => this.cleanupExpiredCache(), 5 * 60 * 1000); // 每5分钟清理一次
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // 通用内存缓存
  set<T>(key: string, data: T, expiry?: number): void {
    // 如果缓存已满，删除最旧的项
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(oldestKey);
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry
    });
  }

  get<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (item.expiry && Date.now() - item.timestamp > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data as T;
  }

  // 纹理缓存
  setTexture(key: string, texture: THREE.Texture): void {
    this.textureCache.set(key, texture);
  }

  getTexture(key: string): THREE.Texture | null {
    return this.textureCache.get(key) || null;
  }

  // 几何体缓存
  setGeometry(key: string, geometry: THREE.BufferGeometry): void {
    this.geometryCache.set(key, geometry);
  }

  getGeometry(key: string): THREE.BufferGeometry | null {
    return this.geometryCache.get(key) || null;
  }

  // 材质缓存
  setMaterial(key: string, material: THREE.Material): void {
    this.materialCache.set(key, material);
  }

  getMaterial(key: string): THREE.Material | null {
    return this.materialCache.get(key) || null;
  }

  // 清理过期缓存
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      if (item.expiry && now - item.timestamp > item.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }

  // 清理所有缓存
  clearAll(): void {
    this.memoryCache.clear();
    
    // 释放Three.js资源
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
    
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.geometryCache.clear();
    
    this.materialCache.forEach(material => material.dispose());
    this.materialCache.clear();
  }

  // 获取缓存统计信息
  getStats() {
    return {
      memoryCache: this.memoryCache.size,
      textureCache: this.textureCache.size,
      geometryCache: this.geometryCache.size,
      materialCache: this.materialCache.size
    };
  }

  // LocalStorage缓存（用于持久化数据）
  setLocalStorage(key: string, data: any, expiry?: number): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiry: expiry || this.defaultExpiry
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  getLocalStorage<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(`cache_${key}`);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // 检查是否过期
      if (item.expiry && Date.now() - item.timestamp > item.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.data as T;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  // 清理过期的localStorage缓存
  cleanupLocalStorage(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        try {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            if (item.expiry && now - item.timestamp > item.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // 删除损坏的缓存项
          localStorage.removeItem(key);
        }
      }
    });
  }
}

// 导出单例实例
export const cacheManager = CacheManager.getInstance();

// React Hook for cache management
export const useCacheManager = () => {
  const setCache = <T>(key: string, data: T, expiry?: number) => {
    cacheManager.set(key, data, expiry);
  };

  const getCache = <T>(key: string): T | null => {
    return cacheManager.get<T>(key);
  };

  const clearCache = () => {
    cacheManager.clearAll();
  };

  const getCacheStats = () => {
    return cacheManager.getStats();
  };

  return {
    setCache,
    getCache,
    clearCache,
    getCacheStats,
    setTexture: cacheManager.setTexture.bind(cacheManager),
    getTexture: cacheManager.getTexture.bind(cacheManager),
    setGeometry: cacheManager.setGeometry.bind(cacheManager),
    getGeometry: cacheManager.getGeometry.bind(cacheManager),
    setMaterial: cacheManager.setMaterial.bind(cacheManager),
    getMaterial: cacheManager.getMaterial.bind(cacheManager)
  };
};