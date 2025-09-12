import { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
}

const LazyWrapper = ({ 
  children, 
  fallback, 
  errorFallback,
  className = '' 
}: LazyWrapperProps) => {
  const defaultFallback = (
    <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
      <LoadingSpinner size="lg" text="加载3D场景中..." />
    </div>
  );

  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className={className}
        >
          {children}
        </motion.div>
      </Suspense>
    </ErrorBoundary>
  );
};

// 高阶组件：为组件添加懒加载功能
export const withLazyLoading = <P extends Record<string, any>>(
  Component: ComponentType<P>,
  loadingText?: string
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return (props: P) => (
    <LazyWrapper 
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <LoadingSpinner size="lg" text={loadingText || '加载组件中...'} />
        </div>
      }
    >
      <LazyComponent {...(props as any)} />
    </LazyWrapper>
  );
};

// 预加载函数
export const preloadComponent = (importFn: () => Promise<any>) => {
  const componentImport = importFn();
  return componentImport;
};

// 懒加载3D组件的特殊包装器
export const Lazy3DWrapper = ({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) => {
  return (
    <LazyWrapper 
      className={className}
      fallback={
        <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-dark-400 to-dark-300 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="xl" text="初始化3D引擎..." />
            <div className="mt-4 text-sm text-gray-400">
              首次加载可能需要几秒钟
            </div>
          </div>
        </div>
      }
      errorFallback={
        <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-red-900/20 to-dark-300 rounded-lg">
          <div className="text-center max-w-md px-6">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-xl font-bold text-white mb-2">
              3D场景加载失败
            </h3>
            <p className="text-gray-300 mb-4">
              您的浏览器可能不支持WebGL，或者显卡驱动需要更新。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              重新尝试
            </button>
          </div>
        </div>
      }
    >
      {children}
    </LazyWrapper>
  );
};

export default LazyWrapper;