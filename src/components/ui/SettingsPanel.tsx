import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PerformancePanel from './PerformancePanel';

interface SettingsState {
  quality: 'low' | 'medium' | 'high';
  shadows: boolean;
  particles: boolean;
  animations: boolean;
  autoRotate: boolean;
  showStats: boolean;
}

const SettingsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPerformancePanel, setShowPerformancePanel] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    quality: 'medium',
    shadows: true,
    particles: true,
    animations: true,
    autoRotate: false,
    showStats: false
  });

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // 应用设置到全局状态
    if (key === 'showStats') {
      setShowPerformancePanel(value as boolean);
      // 触发性能监控显示/隐藏
      const event = new CustomEvent('toggleStats', { detail: value });
      window.dispatchEvent(event);
    }
  };

  const resetSettings = () => {
    setSettings({
      quality: 'medium',
      shadows: true,
      particles: true,
      animations: true,
      autoRotate: false,
      showStats: false
    });
    setShowPerformancePanel(false);
  };

  const getQualityDescription = (quality: string) => {
    switch (quality) {
      case 'low': return '低画质 - 更好的性能';
      case 'medium': return '中等画质 - 平衡性能';
      case 'high': return '高画质 - 最佳视觉效果';
      default: return '';
    }
  };

  return (
    <>
      {/* 设置按钮 */}
      <motion.button
        className="fixed top-20 left-4 z-50 glass p-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </motion.button>

      {/* 设置面板 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed top-20 left-16 z-50 glass p-6 rounded-lg w-80 max-h-[70vh] overflow-y-auto"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="space-y-6">
              {/* 标题 */}
              <div className="flex justify-between items-center border-b border-white/20 pb-3">
                <h3 className="text-lg font-semibold text-white">显示设置</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 画质设置 */}
              <div className="space-y-3">
                <label className="text-white font-medium">画质设置</label>
                <div className="space-y-2">
                  {(['low', 'medium', 'high'] as const).map((quality) => (
                    <label key={quality} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="quality"
                        checked={settings.quality === quality}
                        onChange={() => updateSetting('quality', quality)}
                        className="text-blue-500"
                      />
                      <div>
                        <div className="text-white capitalize">{quality}</div>
                        <div className="text-xs text-gray-400">
                          {getQualityDescription(quality)}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 视觉效果 */}
              <div className="space-y-3">
                <label className="text-white font-medium">视觉效果</label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">阴影效果</span>
                    <input
                      type="checkbox"
                      checked={settings.shadows}
                      onChange={(e) => updateSetting('shadows', e.target.checked)}
                      className="toggle"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">粒子效果</span>
                    <input
                      type="checkbox"
                      checked={settings.particles}
                      onChange={(e) => updateSetting('particles', e.target.checked)}
                      className="toggle"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">动画效果</span>
                    <input
                      type="checkbox"
                      checked={settings.animations}
                      onChange={(e) => updateSetting('animations', e.target.checked)}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>

              {/* 交互设置 */}
              <div className="space-y-3">
                <label className="text-white font-medium">交互设置</label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">自动旋转</span>
                    <input
                      type="checkbox"
                      checked={settings.autoRotate}
                      onChange={(e) => updateSetting('autoRotate', e.target.checked)}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>

              {/* 开发者选项 */}
              <div className="space-y-3">
                <label className="text-white font-medium">开发者选项</label>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">性能统计</span>
                    <input
                      type="checkbox"
                      checked={settings.showStats}
                      onChange={(e) => updateSetting('showStats', e.target.checked)}
                      className="toggle"
                    />
                  </label>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-3 pt-3 border-t border-white/20">
                <button
                  onClick={resetSettings}
                  className="flex-1 glass px-4 py-2 rounded-lg text-white hover:bg-white/20 transition-all duration-300"
                >
                  重置
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 btn-primary"
                >
                  确定
                </button>
              </div>

              {/* 提示信息 */}
              <div className="text-xs text-gray-400 text-center">
                设置会自动保存到本地存储
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 性能监控面板 */}
      <PerformancePanel 
        isVisible={showPerformancePanel} 
        onClose={() => {
          setShowPerformancePanel(false);
          setSettings(prev => ({ ...prev, showStats: false }));
        }} 
      />
    </>
  );
};

export default SettingsPanel;