import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 性能统计数据接口
 */
interface PerformanceStats {
  /** 每秒帧数 */
  fps: number;
  /** 单帧渲染时间（毫秒） */
  frameTime: number;
  /** 内存使用量（MB），可选 */
  memoryUsage?: number;
  /** 绘制调用次数，可选 */
  drawCalls?: number;
}

/**
 * 性能监控组件属性接口
 */
interface PerformanceMonitorProps {
  /** 是否默认显示统计信息 */
  showStats?: boolean;
  /** 性能数据变化时的回调函数 */
  onPerformanceChange?: (stats: PerformanceStats) => void;
}

/**
 * 性能监控组件
 * 实时跟踪和展示应用的性能指标，包括FPS、帧时间、内存使用等
 * 支持键盘快捷键切换显示，并在性能较差时显示警告
 * 
 * @param showStats 是否默认显示统计信息
 * @param onPerformanceChange 性能数据变化时的回调函数
 */
const PerformanceMonitor = ({ 
  showStats = false, 
  onPerformanceChange 
}: PerformanceMonitorProps) => {
  // 性能统计数据状态
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0
  });
  // 控制监控面板的显示状态
  const [isVisible, setIsVisible] = useState(showStats);

  // FPS和性能数据计算
  useEffect(() => {
    let frameCount = 0; // 帧计数器
    let lastTime = performance.now(); // 上一帧时间
    let lastFpsUpdate = performance.now(); // 上次FPS更新时间
    let animationId: number;

    const updateStats = () => {
      frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      // 每秒更新一次FPS统计
      if (currentTime - lastFpsUpdate >= 1000) {
        // 计算FPS：帧数 / 时间间隔
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        const frameTime = deltaTime;
        
        // 获取内存使用情况（仅在支持的浏览器中）
        const memoryUsage = (performance as any).memory 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) // 转换为MB
          : undefined;
        
        const newStats = {
          fps,
          frameTime: Math.round(frameTime * 100) / 100, // 保留两位小数
          memoryUsage,
          drawCalls: 0 // TODO: 实现绘制调用统计
        };
        
        setStats(newStats);
        onPerformanceChange?.(newStats); // 通知外部组件性能变化
        
        // 重置计数器
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
      
      lastTime = currentTime;
      animationId = requestAnimationFrame(updateStats); // 下一帧继续监控
    };

    animationId = requestAnimationFrame(updateStats);

    // 清理函数：取消动画帧请求
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onPerformanceChange]);

  // 键盘快捷键监听：F3或Ctrl+I切换显示
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // F3键或Ctrl+I组合键切换监控面板显示
      if (e.key === 'F3' || (e.ctrlKey && e.key === 'i')) {
        e.preventDefault(); // 阻止默认行为
        setIsVisible(prev => !prev); // 切换显示状态
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 根据FPS判断性能状态
  const getPerformanceStatus = () => {
    if (stats.fps >= 50) return { status: 'good', color: 'text-green-400' }; // 良好：>=50 FPS
    if (stats.fps >= 30) return { status: 'warning', color: 'text-yellow-400' }; // 一般：30-49 FPS
    return { status: 'poor', color: 'text-red-400' }; // 较差：<30 FPS
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <>
      {/* 性能统计面板 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed top-20 right-4 z-50 glass p-4 rounded-lg text-sm font-mono"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="text-white font-semibold">性能监控</span>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-300">FPS:</span>
                  <span className={performanceStatus.color}>
                    {stats.fps}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">帧时间:</span>
                  <span className="text-white">
                    {stats.frameTime}ms
                  </span>
                </div>
                
                {stats.memoryUsage !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-300">内存:</span>
                    <span className="text-white">
                      {stats.memoryUsage}MB
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-300">状态:</span>
                  <span className={performanceStatus.color}>
                    {performanceStatus.status === 'good' && '良好'}
                    {performanceStatus.status === 'warning' && '一般'}
                    {performanceStatus.status === 'poor' && '较差'}
                  </span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 pt-2 border-t border-white/20">
                按F3或Ctrl+I切换显示
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 性能警告提示 */}
      <AnimatePresence>
        {stats.fps > 0 && stats.fps < 20 && (
          <motion.div
            className="fixed bottom-4 right-4 z-50 bg-red-600/90 text-white p-4 rounded-lg max-w-sm"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="flex items-start space-x-3">
              <div className="text-xl">⚠️</div>
              <div>
                <h4 className="font-semibold mb-1">性能警告</h4>
                <p className="text-sm">
                  当前帧率较低 ({stats.fps} FPS)，建议降低画质设置或关闭部分特效。
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PerformanceMonitor;