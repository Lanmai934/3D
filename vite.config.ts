import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // 启用React Fast Refresh
      fastRefresh: true,
      // 优化JSX运行时
      jsxRuntime: 'automatic'
    }),
    // 包体积分析工具
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.fbx', '**/*.hdr'],
  optimizeDeps: {
    include: [
      'three', 
      '@react-three/fiber', 
      '@react-three/drei',
      'framer-motion',
      'react-router-dom'
    ],
    // 排除不需要预构建的依赖
    exclude: ['@vite/client', '@vite/env']
  },
  server: {
    host: true,
    port: 3000,
    // 启用HTTP/2
    https: false,
    // 预热常用文件
    warmup: {
      clientFiles: ['./src/main.tsx', './src/App.tsx']
    }
  },
  build: {
    // 启用源码映射用于调试
    sourcemap: false,
    // 设置chunk大小警告限制
    chunkSizeWarningLimit: 1000,
    // 启用CSS代码分割
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // 更细粒度的代码分割
        manualChunks: (id) => {
          // Three.js相关
          if (id.includes('three')) {
            return 'three';
          }
          // React Three相关
          if (id.includes('@react-three')) {
            return 'react-three';
          }
          // 动画库
          if (id.includes('framer-motion')) {
            return 'animation';
          }
          // React核心
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // 路由
          if (id.includes('react-router')) {
            return 'router';
          }
          // 其他第三方库
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // 优化文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        // 移除console.log
        drop_console: true,
        // 移除debugger
        drop_debugger: true,
        // 移除未使用的代码
        pure_funcs: ['console.log', 'console.info'],
        // 启用更激进的优化
        passes: 2,
        unsafe: true,
        unsafe_comps: true
      },
      mangle: {
        // 混淆变量名
        toplevel: true
      }
    },
    // 启用Tree-shaking
    treeshake: {
      preset: 'recommended',
      moduleSideEffects: false
    }
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  }
})