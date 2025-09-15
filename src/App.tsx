import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LazyWrapper from './components/ui/LazyWrapper';
import SettingsPanel from './components/ui/SettingsPanel';
import { useAppStore } from './store/useAppStore';
import { cacheManager } from './utils/cacheManager';
// 移除未使用的导入

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  const { theme } = useAppStore();

  useEffect(() => {
    // 初始化缓存管理器
    cacheManager.cleanupLocalStorage();
    
    // 预加载关键资源（仅加载存在的资源）
    // 注意：当前项目中不存在实际的3D资源文件，这里注释掉避免加载错误
    // 在实际项目中，应该添加真实的资源文件到public目录
    /*
    resourcePreloader.addResources([
      { url: '/models/cube.glb', type: 'model', priority: 'high' },
      { url: '/textures/environment.hdr', type: 'texture', priority: 'high' },
      { url: '/textures/normal.jpg', type: 'texture', priority: 'medium' },
      { url: '/data/projects.json', type: 'json', priority: 'medium' }
    ]);
    */

    // 开始预加载（当前暂时禁用，避免加载不存在的资源）
    /*
    resourcePreloader.preload(
      (loaded, total) => {
        console.log(`预加载进度: ${loaded}/${total}`);
      },
      (resources) => {
        console.log('资源预加载完成:', resources.size);
      },
      (error, item) => {
        console.warn('资源加载失败:', item.url, error);
      }
    );
    */
    
    // 初始化性能监控
    console.log('应用初始化完成，性能监控已启动');

    // 性能监控初始化将在各个3D组件中进行
    
    // 清理函数
    return () => {
      // 组件卸载时不清理缓存，保持缓存以提高性能
    };
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark' ? 'bg-dark-300' : 'bg-gray-100'
      }`}>
        <Navbar />
        <SettingsPanel />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route 
              path="/" 
              element={
                <LazyWrapper fallback={<LoadingSpinner size="lg" text="加载首页中..." />}>
                  <Home />
                </LazyWrapper>
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <LazyWrapper fallback={<LoadingSpinner size="lg" text="加载作品集中..." />}>
                  <Portfolio />
                </LazyWrapper>
              } 
            />
            <Route 
              path="/about" 
              element={
                <LazyWrapper fallback={<LoadingSpinner size="lg" text="加载关于页面中..." />}>
                  <About />
                </LazyWrapper>
              } 
            />
            <Route 
              path="/contact" 
              element={
                <LazyWrapper fallback={<LoadingSpinner size="lg" text="加载联系页面中..." />}>
                  <Contact />
                </LazyWrapper>
              } 
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;