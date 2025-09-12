import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Environment, Stars, Float } from '@react-three/drei';
import { 
  Mesh, 
  Points, 
  DoubleSide,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  MeshStandardMaterial,
  MeshBasicMaterial,
  SphereGeometry,
  RingGeometry
} from '../../../utils/threeShared';
import { 
  motion, 
  AnimatePresence,
  MOTION_VARIANTS,
  MOTION_TRANSITIONS,
  MOTION_GESTURES
} from '../../../utils/motionShared';

// VR场景类型
type VRScene = 'space' | 'underwater' | 'forest' | 'city' | 'museum';



// 交互热点接口
interface Hotspot {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
  type: 'info' | 'teleport' | 'interaction';
}

// 浮动粒子组件
const FloatingParticles: React.FC<{ scene: VRScene }> = React.memo(({ scene }) => {
  const particlesRef = useRef<Points>(null);
  const particleCount = 150; // 减少粒子数量
  
  const particleColor = useMemo(() => {
    switch (scene) {
      case 'space': return '#ffffff';
      case 'underwater': return '#00bfff';
      case 'forest': return '#90ee90';
      case 'city': return '#ffd700';
      case 'museum': return '#dda0dd';
      default: return '#ffffff';
    }
  }, [scene]);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.0008; // 减慢动画
      particlesRef.current.rotation.x += 0.0004;
    }
  });

  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
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

// 3D热点组件
interface HotspotMarkerProps {
  hotspot: Hotspot;
  onSelect: (hotspot: Hotspot) => void;
  isSelected: boolean;
}

const HotspotMarker: React.FC<HotspotMarkerProps> = React.memo(({ hotspot, onSelect, isSelected }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const hotspotColor = useMemo(() => {
    switch (hotspot.type) {
      case 'info': return '#4a90e2';
      case 'teleport': return '#50c878';
      case 'interaction': return '#ff6b6b';
      default: return '#ffffff';
    }
  }, [hotspot.type]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = hotspot.position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.08; // 减慢动画
      if (isSelected || hovered) {
        meshRef.current.rotation.y += 0.015; // 减慢旋转
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

// VR环境组件
interface VREnvironmentProps {
  scene: VRScene;
}

const VREnvironment: React.FC<VREnvironmentProps> = React.memo(({ scene }) => {
  const environmentPreset = useMemo(() => {
    switch (scene) {
      case 'space': return 'night';
      case 'underwater': return 'dawn';
      case 'forest': return 'forest';
      case 'city': return 'sunset';
      case 'museum': return 'studio';
      default: return 'sunset';
    }
  }, [scene]);

  const backgroundColor = useMemo(() => {
    switch (scene) {
      case 'space': return '#000011';
      case 'underwater': return '#006994';
      case 'forest': return '#2d5016';
      case 'city': return '#1a1a2e';
      case 'museum': return '#f5f5f5';
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

// VR场景选择器
interface VRSceneSelectorProps {
  currentScene: VRScene;
  onSceneChange: (scene: VRScene) => void;
}

const VRSceneSelector: React.FC<VRSceneSelectorProps> = React.memo(({ currentScene, onSceneChange }) => {
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

// VR控制面板
interface VRControlPanelProps {
  isVRMode: boolean;
  onToggleVR: () => void;
  selectedHotspot: Hotspot | null;
  onCloseHotspot: () => void;
}

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

// 主VR体验组件
const VRExperience: React.FC = () => {
  const [currentScene, setCurrentScene] = useState<VRScene>('space');
  const [isVRMode, setIsVRMode] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // 场景热点数据
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

  const handleSceneChange = useCallback((scene: VRScene) => {
    setCurrentScene(scene);
    setSelectedHotspot(null);
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

  const currentHotspots = useMemo(() => getSceneHotspots(currentScene), [currentScene]);

  const cameraConfig = useMemo(() => ({
    position: [0, 0, 5] as [number, number, number],
    fov: isVRMode ? 110 : 75
  }), [isVRMode]);

  const glConfig = useMemo(() => ({
    antialias: true,
    powerPreference: 'high-performance' as const,
    alpha: false
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