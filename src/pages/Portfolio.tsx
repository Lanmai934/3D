import { useState } from 'react';
import { motion } from 'framer-motion';
import Scene3D from '../components/3d/Scene3D';
import FloatingCube from '../components/3d/FloatingCube';
import InteractiveGallery3D from '../components/3d/InteractiveGallery3D';
import ProductVisualization from '../components/3d/ProductVisualization';
import ProductionDashboard from '../components/3d/ProductionDashboard';
import VRExperience from '../components/3d/VRExperience';
import ArchitecturalVisualization from '../components/3d/ArchitecturalVisualization';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  color: string;
  position: [number, number, number];
  technologies: string[];
}

const Portfolio = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [showProductVisualization, setShowProductVisualization] = useState(false);
  const [showProductionDashboard, setShowProductionDashboard] = useState(false);
  const [showVRExperience, setShowVRExperience] = useState(false);
  const [showArchitecturalVisualization, setShowArchitecturalVisualization] = useState(false);

  const projects: Project[] = [
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
    }
  ];

  const categories = [
    { id: 'all', name: '全部' },
    { id: 'web3d', name: 'Web 3D' },
    { id: 'visualization', name: '可视化' },
    { id: 'dataviz', name: '数据可视化' },
    { id: 'vr', name: 'VR/AR' },
    { id: 'architecture', name: '建筑可视化' }
  ];

  const filteredProjects = selectedCategory === 'all' 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

  return (
    <div className="pt-16 min-h-screen">
      {/* Header */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="gradient-text">作品集</span>
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            探索我的3D创作之旅，每个项目都是技术与艺术的完美结合
          </motion.p>
        </div>
      </section>

      {/* 3D Scene */}
      <section className="h-96 mb-12">
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
      </section>

      {/* Category Filter */}
      <section className="px-4 mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-lg transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'glass text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                className="card-3d cursor-pointer group"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
onClick={() => {
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
                  } else {
                    setSelectedProject(project);
                  }
                }}
                whileHover={{ y: -10 }}
              >
                {/* Project Preview */}
                <div 
                  className="h-48 rounded-lg mb-4 relative overflow-hidden"
                  style={{ backgroundColor: project.color + '20' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.id}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                {/* Project Info */}
                <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-primary-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                  {project.description}
                </p>
                
                {/* Technologies */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-white/10 text-xs rounded-full text-gray-300"
                    >
                      {tech}
                    </span>
                  ))}
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

      {/* 3D Gallery Modal */}
      {showGallery && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full h-full relative">
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            <InteractiveGallery3D />
          </div>
        </motion.div>
      )}

      {/* Product Visualization Modal */}
      {showProductVisualization && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full h-full relative">
            <button
              onClick={() => setShowProductVisualization(false)}
              className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            <ProductVisualization />
          </div>
        </motion.div>
      )}

      {/* Production Dashboard Modal */}
      {showProductionDashboard && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="w-full h-full relative">
            <button
              onClick={() => setShowProductionDashboard(false)}
              className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            <ProductionDashboard />
          </div>
        </motion.div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <motion.div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            className="glass max-w-2xl w-full rounded-xl p-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">{selectedProject.title}</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-gray-300 mb-6">{selectedProject.description}</p>
            
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

      {/* VR Experience Modal */}
      {showVRExperience && (
        <motion.div
          className="fixed inset-0 bg-black z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            onClick={() => setShowVRExperience(false)}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <VRExperience />
         </motion.div>
       )}

       {/* Architectural Visualization Modal */}
       {showArchitecturalVisualization && (
         <motion.div
           className="fixed inset-0 bg-black z-50"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
         >
           <button
             onClick={() => setShowArchitecturalVisualization(false)}
             className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
           >
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
             </svg>
           </button>
           <ArchitecturalVisualization />
         </motion.div>
       )}
    </div>
  );
};

export default Portfolio;