import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import ErrorBoundary from './components/ui/ErrorBoundary.tsx'
import PerformanceMonitor from './components/ui/PerformanceMonitor.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <PerformanceMonitor showStats={false} />
    </ErrorBoundary>
  </React.StrictMode>,
)