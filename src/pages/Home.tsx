import { motion } from 'framer-motion';
import Scene3D from '../components/3d/Scene3D';
import FloatingCube from '../components/3d/FloatingCube';
import ParticleField from '../components/3d/ParticleField';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="relative">
      {/* Hero Section with 3D Scene */}
      <section className="h-screen relative overflow-hidden">
        {/* 3D Background */}
        <div className="absolute inset-0">
          <Scene3D enableControls={true} showEnvironment={true}>
            <ParticleField count={800} radius={15} />
            <FloatingCube position={[0, 0, 0]} color="#3b82f6" text="3D" />
            <FloatingCube position={[-3, 1, -2]} color="#8b5cf6" text="React" />
            <FloatingCube position={[3, -1, -1]} color="#06b6d4" text="Three" />
          </Scene3D>
        </div>
        
        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-4">
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-6"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              <span className="gradient-text">3D</span>
              <span className="text-white ml-4">作品集</span>
            </motion.h1>
            
            <motion.p
              className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              探索创意与技术的完美融合，体验沉浸式的3D视觉盛宴
            </motion.p>
            
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.1 }}
            >
              <Link
                to="/portfolio"
                className="btn-primary inline-flex items-center justify-center"
              >
                查看作品
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                to="/about"
                className="glass px-6 py-3 rounded-lg text-white hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center"
              >
                了解更多
              </Link>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">技术特色</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              基于现代Web技术栈，打造流畅的3D交互体验
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'React + Three.js',
                description: '结合React的组件化开发与Three.js的强大3D渲染能力',
                icon: '⚛️'
              },
              {
                title: '响应式设计',
                description: '适配各种设备尺寸，提供一致的用户体验',
                icon: '📱'
              },
              {
                title: '性能优化',
                description: '采用最佳实践，确保流畅的3D渲染性能',
                icon: '⚡'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="card-3d text-center"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;