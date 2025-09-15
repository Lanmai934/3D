/**
 * 缓存管理工具
 * 提供内存缓存、Three.js资源缓存和LocalStorage持久化缓存功能
 * 支持自动过期清理、资源释放和缓存统计
 */
import * as THREE from 'three';

/**
 * 缓存项接口
 * 定义缓存数据的基本结构
 */
interface CacheItem<T> {
  /** 缓存的数据内容 */
  data: T;
  /** 缓存创建时间戳 */
  timestamp: number;
  /** 过期时间（毫秒），可选 */
  expiry?: number;
}

/**
 * 缓存管理器类
 * 采用单例模式，提供多种类型的缓存管理功能
 * 包含内存缓存、Three.js资源缓存和持久化存储
 */
export class CacheManager {
  /** 单例实例 */
  private static instance: CacheManager;
  /** 通用内存缓存存储 */
  private memoryCache = new Map<string, CacheItem<any>>();
  /** Three.js纹理缓存 */
  private textureCache = new Map<string, THREE.Texture>();
  /** Three.js几何体缓存 */
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  /** Three.js材质缓存 */
  private materialCache = new Map<string, THREE.Material>();
  /** 最大内存缓存项数，防止内存溢出 */
  private maxMemoryCacheSize = 100;
  /** 默认过期时间：30分钟 */
  private defaultExpiry = 30 * 60 * 1000;

  /**
   * 私有构造函数，确保单例模式
   * 启动定时清理任务
   */
  private constructor() {
    // 定期清理过期缓存，每5分钟执行一次
    setInterval(() => this.cleanupExpiredCache(), 5 * 60 * 1000);
  }

  /**
   * 获取缓存管理器单例实例
   * @returns CacheManager实例
   */
  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  /**
   * 设置通用内存缓存
   * 采用LRU策略，当缓存满时删除最旧的项
   * @param key 缓存键
   * @param data 缓存数据
   * @param expiry 过期时间（毫秒），可选
   */
  set<T>(key: string, data: T, expiry?: number): void {
    // LRU策略：如果缓存已满，删除最旧的项
    if (this.memoryCache.size >= this.maxMemoryCacheSize) {
      const oldestKey = this.memoryCache.keys().next().value;
      if (oldestKey) {
        this.memoryCache.delete(oldestKey);
      }
    }

    // 创建缓存项并存储
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      expiry: expiry || this.defaultExpiry
    });
  }

  /**
   * 获取通用内存缓存
   * 自动检查过期时间并清理过期项
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  get<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) return null;

    // 检查缓存是否过期
    if (item.expiry && Date.now() - item.timestamp > item.expiry) {
      this.memoryCache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * 设置Three.js纹理缓存
   * 用于缓存纹理资源，避免重复加载
   * @param key 纹理缓存键
   * @param texture Three.js纹理对象
   */
  setTexture(key: string, texture: THREE.Texture): void {
    this.textureCache.set(key, texture);
  }

  /**
   * 获取Three.js纹理缓存
   * @param key 纹理缓存键
   * @returns 纹理对象或null
   */
  getTexture(key: string): THREE.Texture | null {
    return this.textureCache.get(key) || null;
  }

  /**
   * 设置Three.js几何体缓存
   * 用于缓存几何体资源，提高渲染性能
   * @param key 几何体缓存键
   * @param geometry Three.js几何体对象
   */
  setGeometry(key: string, geometry: THREE.BufferGeometry): void {
    this.geometryCache.set(key, geometry);
  }

  /**
   * 获取Three.js几何体缓存
   * @param key 几何体缓存键
   * @returns 几何体对象或null
   */
  getGeometry(key: string): THREE.BufferGeometry | null {
    return this.geometryCache.get(key) || null;
  }

  /**
   * 设置Three.js材质缓存
   * 用于缓存材质资源，减少重复创建
   * @param key 材质缓存键
   * @param material Three.js材质对象
   */
  setMaterial(key: string, material: THREE.Material): void {
    this.materialCache.set(key, material);
  }

  /**
   * 获取Three.js材质缓存
   * @param key 材质缓存键
   * @returns 材质对象或null
   */
  getMaterial(key: string): THREE.Material | null {
    return this.materialCache.get(key) || null;
  }

  /**
   * 清理过期的内存缓存
   * 定时任务调用，遍历所有缓存项并删除过期项
   * @private
   */
  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, item] of this.memoryCache.entries()) {
      // 检查缓存项是否过期
      if (item.expiry && now - item.timestamp > item.expiry) {
        this.memoryCache.delete(key);
      }
    }
  }

  /**
   * 清理所有缓存
   * 清空内存缓存并正确释放Three.js资源，防止内存泄漏
   */
  clearAll(): void {
    // 清空内存缓存
    this.memoryCache.clear();
    
    // 释放Three.js资源，防止GPU内存泄漏
    this.textureCache.forEach(texture => texture.dispose());
    this.textureCache.clear();
    
    this.geometryCache.forEach(geometry => geometry.dispose());
    this.geometryCache.clear();
    
    this.materialCache.forEach(material => material.dispose());
    this.materialCache.clear();
  }

  /**
   * 获取缓存统计信息
   * 返回各类缓存的当前项目数量
   * @returns 缓存统计对象
   */
  getStats() {
    return {
      memoryCache: this.memoryCache.size,     // 内存缓存项数
      textureCache: this.textureCache.size,   // 纹理缓存项数
      geometryCache: this.geometryCache.size, // 几何体缓存项数
      materialCache: this.materialCache.size  // 材质缓存项数
    };
  }

  /**
   * 设置LocalStorage持久化缓存
   * 用于存储需要跨会话保持的数据
   * @param key 缓存键
   * @param data 缓存数据
   * @param expiry 过期时间（毫秒），可选
   */
  setLocalStorage(key: string, data: any, expiry?: number): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiry: expiry || this.defaultExpiry
      };
      // 添加前缀避免键名冲突
      localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    } catch (error) {
      // 处理存储空间不足等异常
      console.warn('Failed to save to localStorage:', error);
    }
  }

  /**
   * 获取LocalStorage持久化缓存
   * 自动检查过期时间并清理过期项
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  getLocalStorage<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(`cache_${key}`);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // 检查LocalStorage缓存是否过期
      if (item.expiry && Date.now() - item.timestamp > item.expiry) {
        localStorage.removeItem(`cache_${key}`);
        return null;
      }

      return item.data as T;
    } catch (error) {
      // 处理JSON解析错误等异常
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  /**
   * 清理过期的LocalStorage缓存
   * 遍历所有缓存项，删除过期或损坏的数据
   * 建议定期调用以释放存储空间
   */
  cleanupLocalStorage(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    
    keys.forEach(key => {
      // 只处理缓存管理器创建的项
      if (key.startsWith('cache_')) {
        try {
          const itemStr = localStorage.getItem(key);
          if (itemStr) {
            const item = JSON.parse(itemStr);
            // 删除过期的缓存项
            if (item.expiry && now - item.timestamp > item.expiry) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // 删除损坏的缓存项（JSON解析失败等）
          localStorage.removeItem(key);
        }
      }
    });
  }
}

/**
 * 导出缓存管理器单例实例
 * 可直接使用，无需手动创建实例
 */
export const cacheManager = CacheManager.getInstance();

/**
 * React Hook for cache management
 * 提供React组件中使用缓存的便捷接口
 * @returns 缓存操作方法集合
 */
export const useCacheManager = () => {
  /** 设置缓存的便捷方法 */
  const setCache = <T>(key: string, data: T, expiry?: number) => {
    cacheManager.set(key, data, expiry);
  };

  /** 获取缓存的便捷方法 */
  const getCache = <T>(key: string): T | null => {
    return cacheManager.get<T>(key);
  };

  /** 清理所有缓存的便捷方法 */
  const clearCache = () => {
    cacheManager.clearAll();
  };

  /** 获取缓存统计的便捷方法 */
  const getCacheStats = () => {
    return cacheManager.getStats();
  };

  // 返回所有缓存操作方法
  return {
    // 通用缓存方法
    setCache,
    getCache,
    clearCache,
    getCacheStats,
    // Three.js资源缓存方法
    setTexture: cacheManager.setTexture.bind(cacheManager),
    getTexture: cacheManager.getTexture.bind(cacheManager),
    setGeometry: cacheManager.setGeometry.bind(cacheManager),
    getGeometry: cacheManager.getGeometry.bind(cacheManager),
    setMaterial: cacheManager.setMaterial.bind(cacheManager),
    getMaterial: cacheManager.getMaterial.bind(cacheManager)
  };
};