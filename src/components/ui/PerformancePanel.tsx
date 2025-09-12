// 性能监控面板组件
import React, { useState, useEffect } from 'react';
import { performanceOptimizer } from '../../utils/performanceOptimizer';
import { cacheManager } from '../../utils/cacheManager';
import { resourcePreloader } from '../../utils/resourcePreloader';

interface PerformancePanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const PerformancePanel: React.FC<PerformancePanelProps> = ({ isVisible, onClose }) => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    drawCalls: 0,
    triangles: 0,
    geometries: 0,
    textures: 0,
    memoryUsage: 0
  });
  
  const [cacheStats, setCacheStats] = useState({
    memoryCache: 0,
    textureCache: 0,
    geometryCache: 0,
    materialCache: 0
  });
  
  const [preloaderStats, setPreloaderStats] = useState({
    loadedResources: 0,
    queuedResources: 0,
    isLoading: false,
    currentLoads: 0
  });

  useEffect(() => {
    if (!isVisible) return;

    const updateStats = () => {
      setMetrics(performanceOptimizer.getMetrics());
      setCacheStats(cacheManager.getStats());
      setPreloaderStats(resourcePreloader.getStats());
    };

    // 初始更新
    updateStats();

    // 定期更新
    const interval = setInterval(updateStats, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const formatMemory = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (fps: number): string => {
    if (fps >= 50) return 'text-green-400';
    if (fps >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const clearCache = () => {
    cacheManager.clearAll();
    console.log('缓存已清理');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 w-80 bg-dark-200 border border-gray-600 rounded-lg shadow-lg z-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">性能监控</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* 渲染性能 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">渲染性能</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">FPS:</span>
            <span className={getPerformanceColor(metrics.fps)}>
              {metrics.fps.toFixed(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">绘制调用:</span>
            <span className="text-white">{metrics.drawCalls}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">三角形:</span>
            <span className="text-white">{metrics.triangles.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">几何体:</span>
            <span className="text-white">{metrics.geometries}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">纹理:</span>
            <span className="text-white">{metrics.textures}</span>
          </div>
        </div>
      </div>

      {/* 内存使用 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">内存使用</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">JS堆内存:</span>
            <span className="text-white">{formatMemory(metrics.memoryUsage)}</span>
          </div>
        </div>
      </div>

      {/* 缓存统计 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">缓存统计</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">内存缓存:</span>
            <span className="text-white">{cacheStats.memoryCache}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">纹理缓存:</span>
            <span className="text-white">{cacheStats.textureCache}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">几何体缓存:</span>
            <span className="text-white">{cacheStats.geometryCache}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">材质缓存:</span>
            <span className="text-white">{cacheStats.materialCache}</span>
          </div>
        </div>
      </div>

      {/* 资源预加载 */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-300 mb-2">资源预加载</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">已加载:</span>
            <span className="text-white">{preloaderStats.loadedResources}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">队列中:</span>
            <span className="text-white">{preloaderStats.queuedResources}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">正在加载:</span>
            <span className={preloaderStats.isLoading ? 'text-yellow-400' : 'text-green-400'}>
              {preloaderStats.isLoading ? '是' : '否'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">并发加载:</span>
            <span className="text-white">{preloaderStats.currentLoads}</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="space-y-2">
        <button
          onClick={clearCache}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
        >
          清理缓存
        </button>
        <button
          onClick={() => {
            if ((window as any).gc) {
              (window as any).gc();
              console.log('手动触发垃圾回收');
            } else {
              console.log('垃圾回收不可用');
            }
          }}
          className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
        >
          垃圾回收
        </button>
      </div>

      {/* 性能建议 */}
      {metrics.fps < 30 && (
        <div className="mt-4 p-2 bg-yellow-900 border border-yellow-600 rounded text-xs">
          <div className="text-yellow-400 font-medium mb-1">性能建议:</div>
          <div className="text-yellow-200">
            FPS较低，建议降低渲染质量或减少场景复杂度
          </div>
        </div>
      )}

      {metrics.drawCalls > 100 && (
        <div className="mt-2 p-2 bg-orange-900 border border-orange-600 rounded text-xs">
          <div className="text-orange-400 font-medium mb-1">优化建议:</div>
          <div className="text-orange-200">
            绘制调用过多，建议合并几何体或使用实例化渲染
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformancePanel;