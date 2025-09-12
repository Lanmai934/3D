import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/ui/Navbar';
import LoadingSpinner from './components/ui/LoadingSpinner';
import LazyWrapper from './components/ui/LazyWrapper';
import SettingsPanel from './components/ui/SettingsPanel';

// 懒加载页面组件
const Home = lazy(() => import('./pages/Home'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-300">
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