import { motion } from 'framer-motion';
import Scene3D from '../components/3d/Scene3D';
import FloatingCube from '../components/3d/FloatingCube';

const About = () => {
  const skills = [
    { name: 'React', level: 95, color: '#61dafb' },
    { name: 'Three.js', level: 90, color: '#000000' },
    { name: 'TypeScript', level: 88, color: '#3178c6' },
    { name: 'WebGL', level: 85, color: '#990000' },
    { name: 'Blender', level: 80, color: '#f5792a' },
    { name: 'GLSL', level: 75, color: '#5586a4' }
  ];

  const timeline = [
    {
      year: '2024',
      title: '高级3D开发工程师',
      company: '科技创新公司',
      description: '负责Web3D项目的架构设计和核心功能开发，专注于性能优化和用户体验提升。'
    },
    {
      year: '2023',
      title: '前端开发工程师',
      company: '数字媒体公司',
      description: '开发交互式3D应用，参与多个大型项目的前端架构设计和实现。'
    },
    {
      year: '2022',
      title: '3D可视化开发者',
      company: '创业团队',
      description: '从零开始构建3D可视化平台，积累了丰富的WebGL和Three.js开发经验。'
    },
    {
      year: '2021',
      title: '开始3D Web开发',
      company: '自学阶段',
      description: '开始学习Three.js和WebGL技术，完成了第一个3D Web项目。'
    }
  ];

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0">
          <Scene3D enableControls={true} showEnvironment={true}>
            <FloatingCube position={[0, 0, 0]} color="#3b82f6" text="我" />
            <FloatingCube position={[-2, 1, -1]} color="#8b5cf6" text="创" />
            <FloatingCube position={[2, -1, 1]} color="#06b6d4" text="造" />
          </Scene3D>
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <motion.div
            className="glass p-8 rounded-2xl max-w-2xl"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">关于我</span>
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              我是一名充满激情的3D Web开发者，专注于创造令人惊叹的交互式3D体验。
              通过结合前沿的Web技术和创意设计，我致力于推动数字艺术与技术的边界。
            </p>
            <p className="text-gray-300">
              从传统的Web开发到3D图形编程，我的技术栈涵盖了现代前端开发的各个方面。
              我相信技术应该服务于创意，而创意应该推动技术的发展。
            </p>
          </motion.div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">技能专长</span>
            </h2>
            <p className="text-xl text-gray-300">
              掌握的核心技术和工具
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.name}
                className="glass p-6 rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">{skill.name}</h3>
                  <span className="text-sm text-gray-300">{skill.level}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-2 rounded-full"
                    style={{ backgroundColor: skill.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.level}%` }}
                    transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                    viewport={{ once: true }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-dark-200/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              <span className="gradient-text">职业历程</span>
            </h2>
            <p className="text-xl text-gray-300">
              我的3D开发之路
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary-600"></div>
            
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                className="relative flex items-start mb-12 last:mb-0"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 w-4 h-4 bg-primary-600 rounded-full border-4 border-dark-300"></div>
                
                {/* Content */}
                <div className="ml-16 glass p-6 rounded-xl flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                    <span className="text-primary-400 font-medium">{item.year}</span>
                  </div>
                  <p className="text-primary-300 mb-3">{item.company}</p>
                  <p className="text-gray-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-8">
              <span className="gradient-text">设计理念</span>
            </h2>
            <blockquote className="text-2xl text-gray-300 italic mb-8">
              "技术是手段，创意是灵魂，用户体验是目标。"
            </blockquote>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              我相信最好的3D体验来自于技术精湛度与艺术创造力的完美平衡。
              每一个项目都是一次探索的机会，每一行代码都承载着对完美的追求。
              我的目标是创造不仅在技术上先进，更在情感上能够触动用户的数字体验。
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;