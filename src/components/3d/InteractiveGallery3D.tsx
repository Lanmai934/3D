import React, { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Plane, Environment } from '@react-three/drei';
import { Mesh } from 'three';


// 展品接口定义
interface ExhibitItem {
  id: string;
  title: string;
  description: string;
  position: [number, number, number];
  color: string;
  type: 'artwork' | 'sculpture' | 'digital';
}

// 展品组件
interface ExhibitProps {
  item: ExhibitItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const Exhibit: React.FC<ExhibitProps> = ({ item, isSelected, onSelect }) => {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // 悬浮动画
      meshRef.current.position.y = item.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      // 选中时的旋转动画
      if (isSelected) {
        meshRef.current.rotation.y += 0.02;
      }
    }
  });

  const handleClick = useCallback(() => {
    onSelect(item.id);
  }, [item.id, onSelect]);

  return (
    <group position={[item.position[0], item.position[1], item.position[2]]}>
      {/* 展品主体 */}
      <Box
        ref={meshRef}
        args={[1.5, 2, 0.1]}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={hovered || isSelected ? '#ff6b6b' : item.color}
          emissive={isSelected ? '#ff3333' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </Box>
      
      {/* 展品标题 */}
      <Text
        position={[0, -1.5, 0.1]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {item.title}
      </Text>
      
      {/* 展品底座 */}
      <Box args={[2, 0.2, 1]} position={[0, -2.2, 0]}>
        <meshStandardMaterial color="#333333" />
      </Box>
      
      {/* 选中时的光环效果 */}
      {isSelected && (
        <mesh position={[0, 0, -0.2]}>
          <ringGeometry args={[1.8, 2.2, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

// 展厅地面
const GalleryFloor: React.FC = () => {
  return (
    <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
      <meshStandardMaterial color="#2c2c2c" />
    </Plane>
  );
};

// 展厅墙壁
const GalleryWalls: React.FC = () => {
  return (
    <>
      {/* 后墙 */}
      <Plane args={[50, 20]} position={[0, 7, -25]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Plane>
      
      {/* 左墙 */}
      <Plane args={[50, 20]} rotation={[0, Math.PI / 2, 0]} position={[-25, 7, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Plane>
      
      {/* 右墙 */}
      <Plane args={[50, 20]} rotation={[0, -Math.PI / 2, 0]} position={[25, 7, 0]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Plane>
    </>
  );
};

// 展厅照明
const GalleryLighting: React.FC = () => {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.3} />
      
      {/* 主光源 */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 聚光灯 - 照亮展品 */}
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={0.2}
        intensity={0.8}
        castShadow
      />
      
      {/* 点光源 - 营造氛围 */}
      <pointLight position={[-10, 10, -10]} intensity={0.5} color="#4a90e2" />
      <pointLight position={[10, 10, 10]} intensity={0.5} color="#e24a4a" />
    </>
  );
};

// 信息面板组件
interface InfoPanelProps {
  selectedItem: ExhibitItem | null;
  onClose: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedItem, onClose }) => {
  if (!selectedItem) return null;

  return (
    <div className="fixed top-4 right-4 bg-black bg-opacity-80 text-white p-6 rounded-lg max-w-md z-10">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{selectedItem.title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>
      </div>
      <p className="text-gray-300 mb-4">{selectedItem.description}</p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-400">类型:</span>
        <span className="text-sm bg-blue-600 px-2 py-1 rounded">
          {selectedItem.type === 'artwork' ? '艺术作品' : 
           selectedItem.type === 'sculpture' ? '雕塑' : '数字艺术'}
        </span>
      </div>
    </div>
  );
};

// 主展厅组件
const InteractiveGallery3D: React.FC = () => {
  const [selectedExhibit, setSelectedExhibit] = useState<string | null>(null);

  // 展品数据
  const exhibits: ExhibitItem[] = [
    {
      id: '1',
      title: '数字艺术作品',
      description: '这是一件融合了现代科技与传统艺术的数字作品，展现了虚拟与现实的完美结合。',
      position: [-8, 0, -15],
      color: '#4a90e2',
      type: 'digital'
    },
    {
      id: '2',
      title: '抽象雕塑',
      description: '这件抽象雕塑通过简洁的线条和几何形状，表达了艺术家对空间和形式的独特理解。',
      position: [0, 0, -15],
      color: '#e24a4a',
      type: 'sculpture'
    },
    {
      id: '3',
      title: '现代绘画',
      description: '这幅现代绘画运用了大胆的色彩和创新的技法，展现了当代艺术的活力与创造力。',
      position: [8, 0, -15],
      color: '#50c878',
      type: 'artwork'
    },
    {
      id: '4',
      title: '互动装置',
      description: '这是一件可以与观众产生互动的艺术装置，通过技术手段创造了全新的艺术体验。',
      position: [-8, 0, -5],
      color: '#ff6b6b',
      type: 'digital'
    },
    {
      id: '5',
      title: '传统工艺',
      description: '这件作品展现了传统工艺的精湛技艺，体现了文化传承与现代展示的完美结合。',
      position: [8, 0, -5],
      color: '#ffa500',
      type: 'artwork'
    }
  ];

  const handleExhibitSelect = useCallback((id: string) => {
    setSelectedExhibit(selectedExhibit === id ? null : id);
  }, [selectedExhibit]);

  const handleCloseInfo = useCallback(() => {
    setSelectedExhibit(null);
  }, []);

  const selectedItem = exhibits.find(item => item.id === selectedExhibit) || null;

  return (
    <div className="w-full h-screen relative">
      <Canvas
        camera={{ position: [0, 5, 20], fov: 60 }}
        shadows
        className="bg-gradient-to-b from-gray-900 to-black"
      >
        {/* 展厅环境 */}
        <GalleryFloor />
        <GalleryWalls />
        <GalleryLighting />
        
        {/* 展品 */}
        {exhibits.map((item) => (
          <Exhibit
            key={item.id}
            item={item}
            isSelected={selectedExhibit === item.id}
            onSelect={handleExhibitSelect}
          />
        ))}
        
        {/* 相机控制 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
        
        {/* 环境贴图 */}
        <Environment preset="warehouse" />
      </Canvas>
      
      {/* 信息面板 */}
      <InfoPanel selectedItem={selectedItem} onClose={handleCloseInfo} />
      
      {/* 控制提示 */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-black bg-opacity-50 p-3 rounded">
        <p>🖱️ 拖拽旋转视角</p>
        <p>🔍 滚轮缩放</p>
        <p>👆 点击展品查看详情</p>
      </div>
    </div>
  );
};

export default InteractiveGallery3D;