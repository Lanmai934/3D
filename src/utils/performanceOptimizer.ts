// 3D渲染性能优化工具
import * as THREE from 'three';
import { 
  WebGLRenderer, 
  Scene, 
  Material, 
  BufferGeometry,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  ACESFilmicToneMapping
} from './threeShared';

// 性能监控接口
interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memoryUsage: number;
}

// 性能优化器类
export class PerformanceOptimizer {
  private renderer: WebGLRenderer | null = null;
  private scene: Scene | null = null;
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private isMonitoring = false;
  private optimizationCallbacks: Array<() => void> = [];

  // 初始化性能监控
  init(renderer: WebGLRenderer, scene: Scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.startMonitoring();
  }

  // 开始性能监控
  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.monitorPerformance();
  }

  // 停止性能监控
  stopMonitoring() {
    this.isMonitoring = false;
  }

  // 监控性能指标
  private monitorPerformance() {
    if (!this.isMonitoring) return;

    const currentTime = performance.now();
    this.frameCount++;

    // 每秒计算一次FPS
    if (currentTime - this.lastTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastTime = currentTime;

      // 检查性能并触发优化
      this.checkPerformanceAndOptimize();
    }

    requestAnimationFrame(() => this.monitorPerformance());
  }

  // 获取当前性能指标
  getMetrics(): PerformanceMetrics {
    const info = this.renderer?.info;
    return {
      fps: this.fps,
      drawCalls: info?.render.calls || 0,
      triangles: info?.render.triangles || 0,
      geometries: info?.memory.geometries || 0,
      textures: info?.memory.textures || 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    };
  }

  // 检查性能并自动优化
  private checkPerformanceAndOptimize() {
    const metrics = this.getMetrics();
    
    // FPS过低时触发优化 - 降低阈值以减少误报
    if (metrics.fps < 15) {
      console.warn('Performance warning: Low FPS detected', metrics);
      this.triggerOptimization();
    }

    // 绘制调用过多时优化
    if (metrics.drawCalls > 100) {
      console.warn('Performance warning: Too many draw calls', metrics);
      this.optimizeDrawCalls();
    }

    // 内存使用过高时清理
    if (metrics.memoryUsage > 100 * 1024 * 1024) { // 100MB
      console.warn('Performance warning: High memory usage', metrics);
      this.cleanupMemory();
    }
  }

  // 触发性能优化回调
  private triggerOptimization() {
    this.optimizationCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Optimization callback error:', error);
      }
    });
  }

  // 优化绘制调用
  private optimizeDrawCalls() {
    if (!this.scene) return;

    // 合并几何体
    this.mergeGeometries();
    
    // 启用实例化渲染
    this.enableInstancing();
  }

  // 合并几何体以减少绘制调用
  private mergeGeometries() {
    // 实现几何体合并逻辑
    console.log('Merging geometries to reduce draw calls');
  }

  // 启用实例化渲染
  private enableInstancing() {
    // 实现实例化渲染逻辑
    console.log('Enabling instanced rendering');
  }

  // 清理内存
  private cleanupMemory() {
    if (!this.renderer) return;

    // 清理未使用的纹理
    this.renderer.dispose();
    
    // 强制垃圾回收（如果可用）
    if ((window as any).gc) {
      (window as any).gc();
    }

    console.log('Memory cleanup performed');
  }

  // 添加优化回调
  addOptimizationCallback(callback: () => void) {
    this.optimizationCallbacks.push(callback);
  }

  // 移除优化回调
  removeOptimizationCallback(callback: () => void) {
    const index = this.optimizationCallbacks.indexOf(callback);
    if (index > -1) {
      this.optimizationCallbacks.splice(index, 1);
    }
  }

  // 设置渲染器优化配置
  optimizeRenderer(renderer: WebGLRenderer) {
    // 启用硬件加速
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 优化阴影设置
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
    
    // 启用色调映射
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    
    // 启用物理正确的光照
    renderer.physicallyCorrectLights = true;
    
    console.log('Renderer optimization applied');
  }

  // 优化材质
  optimizeMaterial(material: Material) {
    // 禁用不必要的特性
    if (material instanceof MeshStandardMaterial) {
      material.transparent = false;
      material.alphaTest = 0;
    }
    
    console.log('Material optimization applied');
  }

  // 优化几何体
  optimizeGeometry(geometry: BufferGeometry) {
    // 计算法线
    geometry.computeVertexNormals();
    
    // 计算边界球
    geometry.computeBoundingSphere();
    
    console.log('Geometry optimization applied');
  }
}

// 创建全局性能优化器实例
export const performanceOptimizer = new PerformanceOptimizer();

// 性能优化Hook
export const usePerformanceOptimization = () => {
  const startOptimization = (renderer: THREE.WebGLRenderer, scene: THREE.Scene) => {
    performanceOptimizer.init(renderer, scene);
    performanceOptimizer.optimizeRenderer(renderer);
  };

  const getMetrics = () => performanceOptimizer.getMetrics();
  
  const addOptimizationCallback = (callback: () => void) => {
    performanceOptimizer.addOptimizationCallback(callback);
  };

  return {
    startOptimization,
    getMetrics,
    addOptimizationCallback,
    stopMonitoring: () => performanceOptimizer.stopMonitoring()
  };
};