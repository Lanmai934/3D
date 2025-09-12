import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  memoryUsage?: number;
  drawCalls?: number;
}

interface PerformanceMonitorProps {
  showStats?: boolean;
  onPerformanceChange?: (stats: PerformanceStats) => void;
}

const PerformanceMonitor = ({ 
  showStats = false, 
  onPerformanceChange 
}: PerformanceMonitorProps) => {
  const [stats, setStats] = useState<PerformanceStats>({
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0
  });
  const [isVisible, setIsVisible] = useState(showStats);

  // FPS计算
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let lastFpsUpdate = performance.now();
    let animationId: number;

    const updateStats = () => {
      frameCount++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      
      // 每秒更新一次FPS
      if (currentTime - lastFpsUpdate >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastFpsUpdate));
        const frameTime = deltaTime;
        
        // 获取内存使用情况（如果支持）
        const memoryUsage = (performance as any).memory 
          ? Math.round((performance as any).memory.usedJSHeapSize / 1048576) 
          : undefined;
        
        const newStats = {
          fps,
          frameTime: Math.round(frameTime * 100) / 100,
          memoryUsage,
          drawCalls: 0
        };
        
        setStats(newStats);
        onPerformanceChange?.(newStats);
        
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
      
      lastTime = currentTime;
      animationId = requestAnimationFrame(updateStats);
    };

    animationId = requestAnimationFrame(updateStats);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [onPerformanceChange]);

  // 键盘快捷键切换显示
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F3' || (e.ctrlKey && e.key === 'i')) {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // 性能警告
  const getPerformanceStatus = () => {
    if (stats.fps >= 50) return { status: 'good', color: 'text-green-400' };
    if (stats.fps >= 30) return { status: 'warning', color: 'text-yellow-400' };
    return { status: 'poor', color: 'text-red-400' };
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