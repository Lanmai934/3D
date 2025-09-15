import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Stars, Float } from '@react-three/drei';
import {
  Mesh,
  DoubleSide,
  Points
} from '../../utils/threeShared';
import { 
  motion, 
  AnimatePresence
} from '../../utils/motionShared';

/**
 * VR场景类型定义
 * 支持五种不同的虚拟现实环境
 */
type VRScene = 'space' | 'underwater' | 'forest' | 'city' | 'museum';

/**
 * 交互热点接口
 * 定义3D场景中可交互的热点标记
 */
interface Hotspot {
  /** 热点唯一标识符 */
  id: string;
  /** 热点在3D空间中的位置坐标 [x, y, z] */
  position: [number, number, number];
  /** 热点显示标题 */
  title: string;
  /** 热点详细描述 */
  description: string;
  /** 热点类型：信息点、传送点或交互点 */
  type: 'info' | 'teleport' | 'interaction';
}

/**
 * 浮动粒子组件
 * 根据不同VR场景渲染相应颜色和效果的粒子系统
 * 使用React.memo优化性能，避免不必要的重渲染
 * 
 * @param scene 当前VR场景类型
 */
const FloatingParticles: React.FC<{ scene: VRScene }> = React.memo(({ scene }) => {
  const particlesRef = useRef<Points>(null);
  const particleCount = 150; // 粒子数量，平衡视觉效果和性能
  
  // 根据场景类型确定粒子颜色
  const particleColor = useMemo(() => {
    switch (scene) {
      case 'space': return '#ffffff'; // 太空：白色星点
      case 'underwater': return '#00bfff'; // 深海：蓝色气泡
      case 'forest': return '#90ee90'; // 森林：绿色光点
      case 'city': return '#ffd700'; // 城市：金色光芒
      case 'museum': return '#dda0dd'; // 博物馆：紫色光尘
      default: return '#ffffff';
    }
  }, [scene]);

  // 粒子动画：缓慢旋转营造动态效果
  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0008; // Y轴旋转速度
      particlesRef.current.rotation.x += 0.0004; // X轴旋转速度
    }
  });

  // 生成随机分布的粒子位置
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      // 在50x50x50的立方体空间内随机分布
      pos[i * 3] = (Math.random() - 0.5) * 50;     // X坐标
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50; // Y坐标
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50; // Z坐标
    }
    return pos;
  }, [particleCount]);

  return (
    <points ref={particlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={particleCount}
              array={positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            color={particleColor}
            size={0.1}
            transparent
            opacity={0.6}
          />
        </points>
  );
});

/**
 * 3D热点标记组件属性接口
 */
interface HotspotMarkerProps {
  /** 热点数据 */
  hotspot: Hotspot;
  /** 热点选择回调函数 */
  onSelect: (hotspot: Hotspot) => void;
  /** 是否为当前选中状态 */
  isSelected: boolean;
}

/**
 * 3D热点标记组件
 * 在3D场景中渲染可交互的热点标记，支持悬停和点击效果
 * 包含球体几何体、光环效果和文本标签
 * 
 * @param hotspot 热点数据
 * @param onSelect 点击选择回调
 * @param isSelected 是否选中状态
 */
const HotspotMarker: React.FC<HotspotMarkerProps> = React.memo(({ hotspot, onSelect, isSelected }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false); // 鼠标悬停状态

  // 根据热点类型确定颜色
  const hotspotColor = useMemo(() => {
    switch (hotspot.type) {
      case 'info': return '#4a90e2';      // 信息点：蓝色
      case 'teleport': return '#50c878';  // 传送点：绿色
      case 'interaction': return '#ff6b6b'; // 交互点：红色
      default: return '#ffffff';
    }
  }, [hotspot.type]);

  // 热点动画效果：上下浮动和旋转
  useFrame((state) => {
    if (meshRef.current) {
      // 上下浮动动画
      meshRef.current.position.y = hotspot.position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.08;
      // 选中或悬停时的旋转动画
      if (isSelected || hovered) {
        meshRef.current.rotation.y += 0.015;
      }
    }
  });

  return (
    <group position={hotspot.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh
          ref={meshRef}
          onClick={() => onSelect(hotspot)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color={hotspotColor}
            emissive={hotspotColor}
            emissiveIntensity={hovered || isSelected ? 0.5 : 0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* 外圈光环 */}
        <mesh>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial
            color={hotspotColor}
            transparent
            opacity={0.3}
            side={DoubleSide}
          />
        </mesh>
        
        {/* 标题文本 */}
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {hotspot.title}
        </Text>
      </Float>
    </group>
  );
});

/**
 * VR环境组件属性接口
 */
interface VREnvironmentProps {
  /** 当前VR场景类型 */
  scene: VRScene;
}

/**
 * VR环境组件
 * 根据场景类型设置相应的环境光照、背景色和特效
 * 包含环境贴图、背景颜色、星空效果和粒子系统
 * 
 * @param scene 当前VR场景类型
 */
const VREnvironment: React.FC<VREnvironmentProps> = React.memo(({ scene }) => {
  // 根据场景选择环境光照预设
  const environmentPreset = useMemo(() => {
    switch (scene) {
      case 'space': return 'night';     // 太空：夜晚光照
      case 'underwater': return 'dawn'; // 深海：黎明光照
      case 'forest': return 'forest';   // 森林：森林光照
      case 'city': return 'sunset';     // 城市：日落光照
      case 'museum': return 'studio';   // 博物馆：工作室光照
      default: return 'sunset';
    }
  }, [scene]);

  // 根据场景设置背景颜色
  const backgroundColor = useMemo(() => {
    switch (scene) {
      case 'space': return '#000011';     // 太空：深蓝黑色
      case 'underwater': return '#006994'; // 深海：深蓝色
      case 'forest': return '#2d5016';    // 森林：深绿色
      case 'city': return '#1a1a2e';      // 城市：深紫色
      case 'museum': return '#f5f5f5';    // 博物馆：浅灰色
      default: return '#87ceeb';
    }
  }, [scene]);

  return (
    <>
      <color attach="background" args={[backgroundColor]} />
      <Environment preset={environmentPreset} />
      {scene === 'space' && <Stars radius={100} depth={50} count={3000} factor={3} />}
      <FloatingParticles scene={scene} />
    </>
  );
});

/**
 * VR场景选择器组件属性接口
 */
interface VRSceneSelectorProps {
  /** 当前选中的场景 */
  currentScene: VRScene;
  /** 场景切换回调函数 */
  onSceneChange: (scene: VRScene) => void;
}

/**
 * VR场景选择器组件
 * 提供用户界面来切换不同的VR场景环境
 * 包含场景图标、名称和切换动画效果
 * 
 * @param currentScene 当前选中的场景
 * @param onSceneChange 场景切换回调
 */
const VRSceneSelector: React.FC<VRSceneSelectorProps> = React.memo(({ currentScene, onSceneChange }) => {
  // 场景配置数据
  const scenes = useMemo(() => [
    { id: 'space' as VRScene, name: '太空探索', icon: '🚀' },
    { id: 'underwater' as VRScene, name: '深海世界', icon: '🌊' },
    { id: 'forest' as VRScene, name: '神秘森林', icon: '🌲' },
    { id: 'city' as VRScene, name: '未来都市', icon: '🏙️' },
    { id: 'museum' as VRScene, name: '虚拟博物馆', icon: '🏛️' }
  ], []);

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-black bg-opacity-70 rounded-lg p-4">
        <h3 className="text-white text-lg font-semibold mb-3">选择VR场景</h3>
        <div className="space-y-2">
          {scenes.map((scene) => (
            <motion.button
              key={scene.id}
              onClick={() => onSceneChange(scene.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                currentScene === scene.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">{scene.icon}</span>
              <span className="font-medium">{scene.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
});

/**
 * VR控制面板组件属性接口
 */
interface VRControlPanelProps {
  /** 是否处于VR模式 */
  isVRMode: boolean;
  /** VR模式切换回调 */
  onToggleVR: () => void;
  /** 当前选中的热点 */
  selectedHotspot: Hotspot | null;
  /** 关闭热点信息回调 */
  onCloseHotspot: () => void;
}

/**
 * VR控制面板组件
 * 提供VR模式切换按钮和热点信息显示面板
 * 包含动画效果和响应式布局
 * 
 * @param isVRMode 是否VR模式
 * @param onToggleVR VR切换回调
 * @param selectedHotspot 选中热点
 * @param onCloseHotspot 关闭热点回调
 */
const VRControlPanel: React.FC<VRControlPanelProps> = React.memo(({
  isVRMode,
  onToggleVR,
  selectedHotspot,
  onCloseHotspot
}) => {
  return (
    <>
      {/* VR模式切换 */}
      <div className="absolute bottom-4 right-4 z-10">
        <motion.button
          onClick={onToggleVR}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isVRMode
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isVRMode ? '🥽 退出VR模式' : '🥽 进入VR模式'}
        </motion.button>
      </div>

      {/* 热点信息面板 */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 left-4 right-4 z-10"
          >
            <div className="bg-black bg-opacity-80 text-white p-6 rounded-lg max-w-md mx-auto">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{selectedHotspot.title}</h3>
                <button
                  onClick={onCloseHotspot}
                  className="text-gray-400 hover:text-white text-xl"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-300 mb-4">{selectedHotspot.description}</p>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">
                  {selectedHotspot.type === 'info' ? '信息点' :
                   selectedHotspot.type === 'teleport' ? '传送点' : '交互点'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

/**
 * 主VR体验组件
 * 整合所有VR功能模块，提供完整的虚拟现实体验
 * 包含场景管理、热点交互、VR模式切换等核心功能
 * 使用React Three Fiber渲染3D场景
 */
const VRExperience: React.FC = () => {
  // 组件状态管理
  const [currentScene, setCurrentScene] = useState<VRScene>('space'); // 当前场景
  const [isVRMode, setIsVRMode] = useState(false); // VR模式状态
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null); // 选中的热点

  // 获取指定场景的热点数据
  const getSceneHotspots = (scene: VRScene): Hotspot[] => {
    const hotspotData: Record<VRScene, Hotspot[]> = {
      space: [
        {
          id: '1',
          position: [5, 2, 0],
          title: '国际空间站',
          description: '探索人类在太空中的家园，了解宇航员的日常生活和科学实验。',
          type: 'info'
        },
        {
          id: '2',
          position: [-3, 1, 4],
          title: '月球表面',
          description: '传送到月球表面，体验低重力环境和壮观的地球景色。',
          type: 'teleport'
        },
        {
          id: '3',
          position: [0, -2, -5],
          title: '火星探测',
          description: '与火星探测器互动，了解火星探索的最新进展。',
          type: 'interaction'
        }
      ],
      underwater: [
        {
          id: '4',
          position: [4, 0, 2],
          title: '珊瑚礁',
          description: '探索色彩斑斓的珊瑚礁生态系统，观察海洋生物的多样性。',
          type: 'info'
        },
        {
          id: '5',
          position: [-2, 3, -3],
          title: '深海潜艇',
          description: '登上深海潜艇，探索海洋最深处的神秘世界。',
          type: 'teleport'
        }
      ],
      forest: [
        {
          id: '6',
          position: [3, 1, 1],
          title: '古树之心',
          description: '触摸千年古树，感受森林的生命力和自然的智慧。',
          type: 'interaction'
        },
        {
          id: '7',
          position: [-4, 2, -2],
          title: '野生动物',
          description: '观察森林中的野生动物，了解它们的生活习性。',
          type: 'info'
        }
      ],
      city: [
        {
          id: '8',
          position: [2, 5, 0],
          title: '天空之城',
          description: '飞行到未来城市的最高点，俯瞰整个智能都市。',
          type: 'teleport'
        },
        {
          id: '9',
          position: [-1, 0, 3],
          title: '智能交通',
          description: '体验未来的智能交通系统和自动驾驶技术。',
          type: 'interaction'
        }
      ],
      museum: [
        {
          id: '10',
          position: [0, 1, 2],
          title: '艺术珍品',
          description: '近距离欣赏世界著名艺术作品的高清3D复制品。',
          type: 'info'
        },
        {
          id: '11',
          position: [3, 0, -2],
          title: '历史时光',
          description: '穿越到历史场景中，亲身体验重要的历史时刻。',
          type: 'teleport'
        }
      ]
    };
    return hotspotData[scene] || [];
  };

  // 事件处理函数
  const handleSceneChange = useCallback((scene: VRScene) => {
    setCurrentScene(scene);
    setSelectedHotspot(null); // 切换场景时清除选中热点
  }, []);

  const handleHotspotSelect = useCallback((hotspot: Hotspot) => {
    setSelectedHotspot(hotspot);
  }, []);

  const handleCloseHotspot = useCallback(() => {
    setSelectedHotspot(null);
  }, []);

  const toggleVRMode = useCallback(() => {
    setIsVRMode(!isVRMode);
  }, [isVRMode]);

  // 计算属性
  const currentHotspots = useMemo(() => getSceneHotspots(currentScene), [currentScene]);

  // 相机配置：VR模式使用更大的视野角
  const cameraConfig = useMemo(() => ({
    position: [0, 0, 5] as [number, number, number],
    fov: isVRMode ? 110 : 75 // VR模式视野角更大
  }), [isVRMode]);

  // WebGL渲染器配置：优化性能设置
  const glConfig = useMemo(() => ({
    antialias: true, // 抗锯齿
    powerPreference: 'high-performance' as const, // 高性能模式
    alpha: false // 禁用透明度以提升性能
  }), []);

  return (
    <div className="w-full h-screen relative bg-black">
      {/* 3D场景 */}
      <Canvas
        camera={cameraConfig}
        gl={glConfig}
        performance={{ min: 0.5 }}
      >
        {/* 环境设置 */}
        <VREnvironment scene={currentScene} />
        
        {/* 照明 */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#4a90e2" />
        
        {/* 热点标记 */}
        {currentHotspots.map((hotspot) => (
          <HotspotMarker
            key={hotspot.id}
            hotspot={hotspot}
            onSelect={handleHotspotSelect}
            isSelected={selectedHotspot?.id === hotspot.id}
          />
        ))}
        
        {/* 相机控制 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={20}
          autoRotate={isVRMode}
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* UI控制面板 */}
      <VRSceneSelector
        currentScene={currentScene}
        onSceneChange={handleSceneChange}
      />
      
      <VRControlPanel
        isVRMode={isVRMode}
        onToggleVR={toggleVRMode}
        selectedHotspot={selectedHotspot}
        onCloseHotspot={handleCloseHotspot}
      />
      
      {/* 使用说明 */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded-lg max-w-xs">
        <p className="mb-2">🎮 <strong>操作指南:</strong></p>
        <p>• 拖拽旋转视角</p>
        <p>• 滚轮缩放</p>
        <p>• 点击热点探索</p>
        <p>• 切换场景体验不同环境</p>
      </div>
      
      {/* 标题信息 */}
      <div className="absolute top-4 right-4 text-right text-white">
        <h2 className="text-2xl font-bold mb-1">虚拟现实体验</h2>
        <p className="text-blue-200">沉浸式3D环境探索</p>
        <div className="mt-2 text-sm text-gray-300">
          当前场景: {currentScene === 'space' ? '太空探索' :
                    currentScene === 'underwater' ? '深海世界' :
                    currentScene === 'forest' ? '神秘森林' :
                    currentScene === 'city' ? '未来都市' : '虚拟博物馆'}
        </div>
      </div>
    </div>
  );
};

export default VRExperience;