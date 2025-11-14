// React核心hooks导入
import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
// 动画相关工具导入
import { 
  motion,
  MOTION_VARIANTS,
  MOTION_TRANSITIONS,
  MOTION_GESTURES,
  createDelayedAnimation
} from '../utils/motionShared';

// 懒加载3D组件以提高性能，避免初始加载时间过长
// 这些组件只有在用户点击相应项目时才会加载
const InteractiveGallery3D = lazy(() => import('../components/3d/InteractiveGallery3D'));
const ProductVisualization = lazy(() => import('../components/3d/ProductVisualization'));
const ProductionDashboard = lazy(() => import('../components/3d/ProductionDashboard'));
const VRExperience = lazy(() => import('../components/3d/VRExperience'));
const ArchitecturalVisualization = lazy(() => import('../components/3d/ArchitecturalVisualization'));
const InteractiveFlowerCanvas = lazy(() => import('../components/3d/InteractiveFlowerCanvas'));

// 项目数据类型定义
interface Project {
  id: number;                           // 项目唯一标识符
  title: string;                        // 项目标题
  description: string;                  // 项目描述
  category: string;                     // 项目分类（用于筛选）
  color: string;                        // 项目主题色（十六进制颜色值）
  position: [number, number, number];   // 3D空间中的位置坐标（暂未使用）
  technologies: string[];               // 使用的技术栈列表
}

/**
 * Portfolio组件 - 作品集展示页面
 * 功能包括：项目分类筛选、项目网格展示、3D模态框交互
 */
const Portfolio = () => {
  // 当前选中的项目分类，默认显示全部项目
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // 当前选中的项目详情，用于显示项目详情模态框
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // 各种3D组件的显示状态控制
  const [showGallery, setShowGallery] = useState(false);                           // 交互式3D展厅
  const [showProductVisualization, setShowProductVisualization] = useState(false); // 产品可视化工具
  const [showProductionDashboard, setShowProductionDashboard] = useState(false);   // 数据可视化大屏
  const [showVRExperience, setShowVRExperience] = useState(false);                 // 虚拟现实体验
  const [showArchitecturalVisualization, setShowArchitecturalVisualization] = useState(false); // 建筑可视化
  const [showFlowerCanvas, setShowFlowerCanvas] = useState(false);                 // 交互式花朵生成器

  // 使用useMemo缓存项目数据，避免每次渲染时重新创建数组
  // 这是性能优化的重要手段，特别是当数据量较大时
  const projects: Project[] = useMemo(() => [
    {
      id: 1,
      title: '交互式3D展厅',
      description: '使用React Three Fiber创建的虚拟展厅，支持实时光照和物理交互',
      category: 'web3d',
      color: '#3b82f6',
      position: [-2, 0, 0],
      technologies: ['React', 'Three.js', 'WebGL', 'GLSL']
    },
    {
      id: 2,
      title: '产品可视化工具',
      description: '为电商平台开发的3D产品展示工具，支持360度查看和AR预览',
      category: 'visualization',
      color: '#8b5cf6',
      position: [0, 1, -1],
      technologies: ['Three.js', 'WebXR', 'Blender', 'GLTF']
    },
    {
      id: 3,
      title: '数据可视化大屏',
      description: '基于3D技术的数据可视化解决方案，实时展示复杂数据关系',
      category: 'dataviz',
      color: '#06b6d4',
      position: [2, -0.5, 0.5],
      technologies: ['D3.js', 'Three.js', 'WebSocket', 'Canvas']
    },
    {
      id: 4,
      title: '虚拟现实体验',
      description: '沉浸式VR体验应用，支持手势交互和空间定位',
      category: 'vr',
      color: '#f59e0b',
      position: [-1, -1, -2],
      technologies: ['WebXR', 'A-Frame', 'Three.js', 'WebRTC']
    },
    {
      id: 5,
      title: '建筑可视化',
      description: '建筑设计的3D可视化展示，包含材质编辑和光照模拟',
      category: 'architecture',
      color: '#ef4444',
      position: [1, 1, 1],
      technologies: ['Three.js', 'Blender', 'PBR', 'HDR']
    },
    {
      id: 6,
      title: '交互式花朵生成器',
      description: '基于WebGL着色器的程序化花朵生成系统，支持实时交互和动画效果',
      category: 'interactive',
      color: '#ec4899',
      position: [0, 0, 2],
      technologies: ['React Three Fiber', 'GLSL', 'WebGL', 'Shader']
    }
  ], []);

  // 缓存分类数据，避免重复创建
  const categories = useMemo(() => [
    { id: 'all', name: '全部' },
    { id: 'web3d', name: 'Web 3D' },
    { id: 'visualization', name: '可视化' },
    { id: 'dataviz', name: '数据可视化' },
    { id: 'vr', name: 'VR/AR' },
    { id: 'architecture', name: '建筑可视化' },
    { id: 'interactive', name: '交互体验' }
  ], []);

  // 根据选中的分类过滤项目列表
  // 使用useMemo优化性能，只有当projects或selectedCategory改变时才重新计算
  const filteredProjects = useMemo(() => 
    selectedCategory === 'all' 
      ? projects 
      : projects.filter(project => project.category === selectedCategory),
    [projects, selectedCategory]
  );
  
  // 项目点击处理函数，使用useCallback优化性能
  // 根据项目标题决定显示哪个3D组件模态框
  const handleProjectClick = useCallback((project: Project) => {
    if (project.title === '交互式3D展厅') {
      setShowGallery(true);
    } else if (project.title === '产品可视化工具') {
      setShowProductVisualization(true);
    } else if (project.title === '数据可视化大屏') {
      setShowProductionDashboard(true);
    } else if (project.title === '虚拟现实体验') {
      setShowVRExperience(true);
    } else if (project.title === '建筑可视化') {
      setShowArchitecturalVisualization(true);
    } else if (project.title === '交互式花朵生成器') {
      setShowFlowerCanvas(true);
    } else {
      setSelectedProject(project);
    }
  }, []);
  
  // 分类切换处理函数，使用useCallback避免不必要的重新渲染
  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  return (
    <div className="pt-16 min-h-screen">
      {/* 页面头部区域 - 包含标题和描述 */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          {/* 主标题，使用motion动画效果 */}
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            variants={MOTION_VARIANTS.slideUp}
            initial="hidden"
            animate="visible"
            transition={MOTION_TRANSITIONS.standard}
          >
            <span className="gradient-text">作品集</span>
          </motion.h1>
          {/* 副标题描述，延迟0.2秒显示 */}
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            variants={createDelayedAnimation(0.2)}
            initial="hidden"
            animate="visible"
          >
            探索我的3D创作之旅，每个项目都是技术与艺术的完美结合
          </motion.p>
        </div>
      </section>

      {/* 3D Scene */}
      {/* <section className="h-96 mb-12">
        <Scene3D enableControls={true} showEnvironment={false}>
          {filteredProjects.map((project) => (
            <group key={project.id}>
              <FloatingCube
                position={project.position}
                color={project.color}
                text={project.id.toString()}
              />
            </group>
          ))}
        </Scene3D>
      </section> */}

      {/* 分类筛选器 - 允许用户按类别筛选项目 */}
      <section className="px-4 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'  // 选中状态样式
                    : 'glass text-gray-300 hover:text-white hover:bg-white/10'  // 未选中状态样式
                }`}
                whileHover={MOTION_GESTURES.hover}  // 悬停动画
                whileTap={MOTION_GESTURES.tap}      // 点击动画
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* 项目网格展示区域 */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {/* 响应式网格布局：中等屏幕2列，大屏幕3列 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="card-3d cursor-pointer group"  // 3D卡片样式，鼠标悬停时显示group效果
                variants={createDelayedAnimation(index * 0.1)}  // 每个卡片延迟0.1秒显示，创造瀑布流效果
                initial="hidden"
                animate="visible"
                onClick={() => handleProjectClick(project)}  // 点击时触发项目详情或3D组件
                whileHover={MOTION_GESTURES.hoverUp}  // 悬停时向上浮动效果
              >
                {/* 项目预览区域 */}
                <div 
                  className="h-48 rounded-lg mb-4 relative overflow-hidden"
                  style={{ backgroundColor: project.color + '20' }}  // 使用项目主题色作为背景，透明度20%
                >
                  {/* 项目ID显示 */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: project.color }}  // 使用项目主题色作为背景
                    >
                      {project.id}
                    </div>
                  </div>
                  {/* 悬停时显示的渐变遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* 项目信息区域 */}
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-primary-400 transition-colors">
                  {project.title}
                </h3>
                {/* 项目描述，最多显示3行 */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                {/* 技术栈标签 */}
                <div className="flex flex-wrap gap-2">
                  {/* 最多显示3个技术标签 */}
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-white/10 text-xs rounded-full text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {/* 如果技术栈超过3个，显示剩余数量 */}
                  {project.technologies.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-xs rounded-full text-gray-300">
                      +{project.technologies.length - 3}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3D交互式展厅模态框 */}
      {showGallery && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}    // 初始透明
          animate={{ opacity: 1 }}    // 动画到不透明
          exit={{ opacity: 0 }}       // 退出时透明
        >
          <div className="w-full h-full relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            {/* 使用Suspense包装懒加载的3D组件，显示加载动画 */}
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
              </div>
            }>
              <InteractiveGallery3D />
            </Suspense>
          </div>
        </motion.div>
      )}

      {/* 产品可视化工具模态框 */}
      {showProductVisualization && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full h-full relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowProductVisualization(false)}
              className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            {/* 懒加载产品可视化组件 */}
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
              </div>
            }>
              <ProductVisualization />
            </Suspense>
          </div>
        </motion.div>
      )}

      {/* 数据可视化大屏模态框 */}
      {showProductionDashboard && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full h-full relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowProductionDashboard(false)}
              className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            {/* 懒加载数据可视化大屏组件 */}
            <Suspense fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
              </div>
            }>
              <ProductionDashboard />
            </Suspense>
          </div>
        </motion.div>
      )}

      {/* 项目详情模态框 - 显示项目的详细信息 */}
      {selectedProject && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedProject(null)}  // 点击背景关闭模态框
        >
          <motion.div
            className="glass max-w-2xl w-full rounded-xl p-8"  // 毛玻璃效果样式
            initial={{ scale: 0.8, opacity: 0 }}  // 初始缩放和透明
            animate={{ scale: 1, opacity: 1 }}    // 动画到正常大小和不透明
            onClick={(e) => e.stopPropagation()}  // 阻止事件冒泡，避免点击内容区域关闭模态框
          >
            {/* 模态框头部 - 标题和关闭按钮 */}
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {/* 关闭图标 */}
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 项目描述 */}
            <p className="text-gray-300 mb-6">{selectedProject.description}</p>
            
            {/* 技术栈展示区域 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-white">使用技术</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProject.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-primary-600/20 text-primary-400 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            
            {/* 操作按钮区域 */}
            <div className="flex gap-4">
              <button className="btn-primary flex-1">
                查看详情
              </button>
              <button className="glass px-6 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300">
                在线演示
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* VR虚拟现实体验模态框 */}
      {showVRExperience && (
        <motion.div
          className="fixed inset-0 bg-black z-50"  // 全屏黑色背景
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setShowVRExperience(false)}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* 懒加载VR体验组件 */}
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
          }>
            <VRExperience />
          </Suspense>
         </motion.div>
       )}

       {/* 建筑可视化模态框 */}
       {showArchitecturalVisualization && (
         <motion.div
           className="fixed inset-0 bg-black z-50"  // 全屏黑色背景
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
         >
           {/* 关闭按钮 */}
           <button
             onClick={() => setShowArchitecturalVisualization(false)}
             className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
           >
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
           {/* 懒加载建筑可视化组件 */}
           <Suspense fallback={
             <div className="flex items-center justify-center h-full">
               <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
             </div>
           }>
             <ArchitecturalVisualization />
           </Suspense>
         </motion.div>
       )}

       {/* 交互式花朵生成器模态框 */}
       {showFlowerCanvas && (
         <motion.div
           className="fixed inset-0 bg-black z-50"  // 全屏黑色背景
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
         >
           {/* 关闭按钮 */}
           <button
             onClick={() => setShowFlowerCanvas(false)}
             className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
           >
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
           {/* 懒加载花朵生成器组件 */}
           <Suspense fallback={
             <div className="flex items-center justify-center h-full">
               <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
             </div>
           }>
             <InteractiveFlowerCanvas />
           </Suspense>
         </motion.div>
       )}
       
    </div>
  );
};

// 导出Portfolio组件作为默认导出
export default Portfolio;