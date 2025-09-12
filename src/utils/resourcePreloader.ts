// 资源预加载器
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { cacheManager } from './cacheManager';

// 资源类型定义
interface ResourceItem {
  url: string;
  type: 'texture' | 'model' | 'audio' | 'json';
  priority: 'high' | 'medium' | 'low';
  preload?: boolean;
}

// 加载进度回调
type ProgressCallback = (loaded: number, total: number, item: ResourceItem) => void;
type CompleteCallback = (resources: Map<string, any>) => void;
type ErrorCallback = (error: Error, item: ResourceItem) => void;

// 资源预加载器类
export class ResourcePreloader {
  private static instance: ResourcePreloader;
  private loadingManager!: THREE.LoadingManager;
  private textureLoader!: THREE.TextureLoader;
  private gltfLoader!: GLTFLoader;
  private dracoLoader!: DRACOLoader;
  private audioLoader!: THREE.AudioLoader;
  private fileLoader!: THREE.FileLoader;
  private loadedResources = new Map<string, any>();
  private loadingQueue: ResourceItem[] = [];
  private isLoading = false;
  private maxConcurrentLoads = 3;
  private currentLoads = 0;

  private constructor() {
    this.setupLoaders();
  }

  static getInstance(): ResourcePreloader {
    if (!ResourcePreloader.instance) {
      ResourcePreloader.instance = new ResourcePreloader();
    }
    return ResourcePreloader.instance;
  }

  private setupLoaders(): void {
    this.loadingManager = new THREE.LoadingManager();
    
    this.textureLoader = new THREE.TextureLoader(this.loadingManager);
    this.gltfLoader = new GLTFLoader(this.loadingManager);
    this.audioLoader = new THREE.AudioLoader(this.loadingManager);
    this.fileLoader = new THREE.FileLoader(this.loadingManager);
    
    // 设置DRACO解码器
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/');
    this.gltfLoader.setDRACOLoader(this.dracoLoader);
  }

  // 添加资源到预加载队列
  addResource(url: string, type: ResourceItem['type'], priority: ResourceItem['priority'] = 'medium'): void {
    const resource: ResourceItem = { url, type, priority };
    
    // 按优先级插入队列
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const insertIndex = this.loadingQueue.findIndex(
      item => priorityOrder[item.priority] > priorityOrder[priority]
    );
    
    if (insertIndex === -1) {
      this.loadingQueue.push(resource);
    } else {
      this.loadingQueue.splice(insertIndex, 0, resource);
    }
  }

  // 批量添加资源
  addResources(resources: Omit<ResourceItem, 'preload'>[]): void {
    resources.forEach(resource => {
      this.addResource(resource.url, resource.type, resource.priority);
    });
  }

  // 开始预加载
  async preload(
    onProgress?: ProgressCallback,
    onComplete?: CompleteCallback,
    onError?: ErrorCallback
  ): Promise<Map<string, any>> {
    if (this.isLoading) {
      console.warn('Preloader is already running');
      return this.loadedResources;
    }

    this.isLoading = true;
    const totalItems = this.loadingQueue.length;
    let loadedItems = 0;

    const loadNext = async (): Promise<void> => {
      if (this.loadingQueue.length === 0 || this.currentLoads >= this.maxConcurrentLoads) {
        return;
      }

      const item = this.loadingQueue.shift()!;
      this.currentLoads++;

      try {
        // 检查缓存
        const cacheKey = `resource_${item.type}_${item.url}`;
        let resource = cacheManager.get(cacheKey);

        if (!resource) {
          resource = await this.loadResource(item);
          // 缓存资源（纹理、几何体、材质使用专门的缓存）
          if (item.type === 'texture' && resource instanceof THREE.Texture) {
            cacheManager.setTexture(cacheKey, resource);
          } else {
            cacheManager.set(cacheKey, resource, 60 * 60 * 1000); // 1小时缓存
          }
        }

        this.loadedResources.set(item.url, resource);
        loadedItems++;
        
        onProgress?.(loadedItems, totalItems, item);
      } catch (error) {
        console.error(`Failed to load resource: ${item.url}`, error);
        onError?.(error as Error, item);
      } finally {
        this.currentLoads--;
        
        // 继续加载下一个资源
        if (this.loadingQueue.length > 0) {
          loadNext();
        } else if (this.currentLoads === 0) {
          // 所有资源加载完成
          this.isLoading = false;
          onComplete?.(this.loadedResources);
        }
      }
    };

    // 启动并发加载
    const concurrentPromises = [];
    for (let i = 0; i < Math.min(this.maxConcurrentLoads, this.loadingQueue.length); i++) {
      concurrentPromises.push(loadNext());
    }
    
    await Promise.all(concurrentPromises);
    return this.loadedResources;
  }

  // 加载单个资源
  private loadResource(item: ResourceItem): Promise<any> {
    return new Promise((resolve, reject) => {
      switch (item.type) {
        case 'texture':
          this.textureLoader.load(
            item.url,
            (texture) => {
              // 优化纹理设置
              texture.generateMipmaps = false;
              texture.minFilter = THREE.LinearFilter;
              texture.magFilter = THREE.LinearFilter;
              resolve(texture);
            },
            undefined,
            reject
          );
          break;

        case 'model':
          this.gltfLoader.load(
            item.url,
            (gltf: any) => {
              // 优化模型
              this.optimizeModel(gltf);
              resolve(gltf);
            },
            undefined,
            reject
          );
          break;

        case 'audio':
          this.audioLoader.load(item.url, resolve, undefined, reject);
          break;

        case 'json':
          this.fileLoader.setResponseType('json');
          this.fileLoader.load(item.url, resolve, undefined, reject);
          break;

        default:
          reject(new Error(`Unsupported resource type: ${item.type}`));
      }
    });
  }

  // 优化加载的模型
  private optimizeModel(gltf: any): void {
    gltf.scene.traverse((child: any) => {
      if (child.isMesh) {
        // 优化几何体
        if (child.geometry) {
          child.geometry.computeBoundingSphere();
          child.geometry.computeBoundingBox();
        }

        // 优化材质
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat: THREE.Material) => {
              this.optimizeMaterial(mat);
            });
          } else {
            this.optimizeMaterial(child.material);
          }
        }

        // 启用阴影
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }

  // 优化材质
  private optimizeMaterial(material: THREE.Material): void {
    if (material instanceof THREE.MeshStandardMaterial) {
      // 减少不必要的计算
      material.transparent = material.opacity < 1;
      material.alphaTest = material.transparent ? 0.1 : 0;
    }
  }

  // 获取已加载的资源
  getResource<T = any>(url: string): T | null {
    return this.loadedResources.get(url) || null;
  }

  // 检查资源是否已加载
  isResourceLoaded(url: string): boolean {
    return this.loadedResources.has(url);
  }

  // 清理资源
  dispose(): void {
    this.loadedResources.forEach((resource) => {
      if (resource && typeof resource.dispose === 'function') {
        resource.dispose();
      }
    });
    this.loadedResources.clear();
    this.loadingQueue.length = 0;
    this.dracoLoader.dispose();
  }

  // 获取加载统计
  getStats() {
    return {
      loadedResources: this.loadedResources.size,
      queuedResources: this.loadingQueue.length,
      isLoading: this.isLoading,
      currentLoads: this.currentLoads
    };
  }
}

// 导出单例实例
export const resourcePreloader = ResourcePreloader.getInstance();

// React Hook for resource preloading
export const useResourcePreloader = () => {
  const addResource = (url: string, type: ResourceItem['type'], priority?: ResourceItem['priority']) => {
    resourcePreloader.addResource(url, type, priority);
  };

  const addResources = (resources: Omit<ResourceItem, 'preload'>[]) => {
    resourcePreloader.addResources(resources);
  };

  const preload = (onProgress?: ProgressCallback, onComplete?: CompleteCallback, onError?: ErrorCallback) => {
    return resourcePreloader.preload(onProgress, onComplete, onError);
  };

  const getResource = <T = any>(url: string): T | null => {
    return resourcePreloader.getResource<T>(url);
  };

  const isResourceLoaded = (url: string): boolean => {
    return resourcePreloader.isResourceLoaded(url);
  };

  const getStats = () => {
    return resourcePreloader.getStats();
  };

  return {
    addResource,
    addResources,
    preload,
    getResource,
    isResourceLoaded,
    getStats
  };
};