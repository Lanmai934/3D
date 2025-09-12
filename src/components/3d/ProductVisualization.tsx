import React, { useRef, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Cylinder, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// 产品接口定义
interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  position: [number, number, number];
  color: string;
  type: 'phone' | 'laptop' | 'watch' | 'headphones' | 'camera';
}

// 产品模型组件
interface ProductModelProps {
  product: Product;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ProductModel: React.FC<ProductModelProps> = React.memo(({ product, isSelected, onSelect }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const handleClick = useCallback(() => {
    onSelect(product.id);
  }, [product.id, onSelect]);

  useFrame((state) => {
    if (meshRef.current) {
      // 悬浮动画（减慢频率）
      meshRef.current.position.y = product.position[1] + Math.sin(state.clock.elapsedTime * 1.2) * 0.04;
      
      // 选中时的旋转动画（减慢速度）
      if (isSelected) {
        meshRef.current.rotation.y += 0.008;
      }
    }
  });

  // 根据产品类型渲染不同的3D模型
  const renderProductModel = () => {
    switch (product.type) {
      case 'phone':
        return (
          <Box args={[0.8, 1.6, 0.1]}>
            <meshStandardMaterial
              color={hovered || isSelected ? '#ff6b6b' : product.color}
              metalness={0.8}
              roughness={0.2}
            />
          </Box>
        );
      case 'laptop':
        return (
          <group>
            {/* 屏幕 */}
            <Box args={[2, 1.2, 0.1]} position={[0, 0.6, 0]} rotation={[-0.2, 0, 0]}>
              <meshStandardMaterial color="#1a1a1a" />
            </Box>
            {/* 键盘 */}
            <Box args={[2, 1.4, 0.1]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color={hovered || isSelected ? '#ff6b6b' : product.color}
                metalness={0.6}
                roughness={0.3}
              />
            </Box>
          </group>
        );
      case 'watch':
        return (
          <group>
            {/* 表盘 */}
            <Cylinder args={[0.4, 0.4, 0.1, 32]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial
                color={hovered || isSelected ? '#ff6b6b' : product.color}
                metalness={0.9}
                roughness={0.1}
              />
            </Cylinder>
            {/* 表带 */}
            <Box args={[0.2, 0.8, 0.05]} position={[0, 0.6, 0]}>
              <meshStandardMaterial color="#333" />
            </Box>
            <Box args={[0.2, 0.8, 0.05]} position={[0, -0.6, 0]}>
              <meshStandardMaterial color="#333" />
            </Box>
          </group>
        );
      case 'headphones':
        return (
          <group>
            {/* 头带 */}
            <Cylinder args={[0.05, 0.05, 1.5, 16]} rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color="#333" />
            </Cylinder>
            {/* 左耳罩 */}
            <Sphere args={[0.3]} position={[-0.7, 0, 0]}>
              <meshStandardMaterial
                color={hovered || isSelected ? '#ff6b6b' : product.color}
                metalness={0.5}
                roughness={0.4}
              />
            </Sphere>
            {/* 右耳罩 */}
            <Sphere args={[0.3]} position={[0.7, 0, 0]}>
              <meshStandardMaterial
                color={hovered || isSelected ? '#ff6b6b' : product.color}
                metalness={0.5}
                roughness={0.4}
              />
            </Sphere>
          </group>
        );
      case 'camera':
        return (
          <group>
            {/* 机身 */}
            <Box args={[1.2, 0.8, 0.6]}>
              <meshStandardMaterial
                color={hovered || isSelected ? '#ff6b6b' : product.color}
                metalness={0.7}
                roughness={0.3}
              />
            </Box>
            {/* 镜头 */}
            <Cylinder args={[0.3, 0.3, 0.4, 32]} position={[0, 0, 0.5]}>
              <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.1} />
            </Cylinder>
          </group>
        );
      default:
        return (
          <Box args={[1, 1, 1]}>
            <meshStandardMaterial color={product.color} />
          </Box>
        );
    }
  };

  return (
    <group position={product.position}>
      <group
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {renderProductModel()}
      </group>
      
      {/* 产品名称 */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {product.name}
      </Text>
      
      {/* 价格标签 */}
      <Text
        position={[0, -1.8, 0]}
        fontSize={0.15}
        color="#4a90e2"
        anchorX="center"
        anchorY="middle"
      >
        {product.price}
      </Text>
      
      {/* 选中时的光环效果 */}
      {isSelected && (
        <mesh position={[0, 0, -0.1]}>
          <ringGeometry args={[1.5, 1.8, 32]} />
          <meshBasicMaterial color="#ffff00" transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
});

// 展示台组件
const DisplayPlatform: React.FC = React.memo(() => {
  return (
    <>
      {/* 主展示台 */}
      <Cylinder args={[8, 8, 0.2, 32]} position={[0, -2, 0]}>
        <meshStandardMaterial color="#2c2c2c" metalness={0.3} roughness={0.7} />
      </Cylinder>
      
      {/* 背景墙 */}
      <Box args={[20, 10, 0.2]} position={[0, 3, -8]}>
        <meshStandardMaterial color="#f5f5f5" />
      </Box>
      
      {/* 阴影 */}
      <ContactShadows
        position={[0, -1.9, 0]}
        opacity={0.4}
        scale={10}
        blur={2}
        far={4}
      />
    </>
  );
});

// 照明系统
const ProductLighting: React.FC = React.memo(() => {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.4} />
      
      {/* 主光源 */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 补光 */}
      <pointLight position={[-5, 5, 5]} intensity={0.6} color="#4a90e2" />
      <pointLight position={[5, 5, -5]} intensity={0.6} color="#e24a4a" />
      
      {/* 聚光灯 */}
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.3}
        intensity={0.8}
        castShadow
      />
    </>
  );
});

// 产品信息面板
interface ProductInfoPanelProps {
  selectedProduct: Product | null;
  onClose: () => void;
}

const ProductInfoPanel: React.FC<ProductInfoPanelProps> = React.memo(({ selectedProduct, onClose }) => {
  if (!selectedProduct) return null;

  return (
    <div className="fixed top-4 right-4 bg-white bg-opacity-95 text-gray-800 p-6 rounded-lg max-w-sm z-10 shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      </div>
      <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-blue-600">{selectedProduct.price}</span>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          查看详情
        </button>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm text-gray-500">类型:</span>
        <span className="text-sm bg-gray-200 px-2 py-1 rounded">
          {selectedProduct.type === 'phone' ? '智能手机' :
           selectedProduct.type === 'laptop' ? '笔记本电脑' :
           selectedProduct.type === 'watch' ? '智能手表' :
           selectedProduct.type === 'headphones' ? '耳机' :
           selectedProduct.type === 'camera' ? '相机' : '其他'}
        </span>
      </div>
    </div>
  );
});

// 主产品可视化组件
const ProductVisualization: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  // 产品数据缓存
  const products = useMemo((): Product[] => [
    {
      id: '1',
      name: 'iPhone 15 Pro',
      description: '最新的iPhone，配备A17 Pro芯片，钛金属设计，专业级摄影系统。',
      price: '¥8,999',
      position: [-3, 0, 2],
      color: '#1d4ed8',
      type: 'phone'
    },
    {
      id: '2',
      name: 'MacBook Pro',
      description: '搭载M3芯片的专业笔记本，14英寸Liquid Retina XDR显示屏。',
      price: '¥14,999',
      position: [0, 0, 0],
      color: '#6b7280',
      type: 'laptop'
    },
    {
      id: '3',
      name: 'Apple Watch Ultra',
      description: '最坚固的Apple Watch，专为极限运动和户外探险而设计。',
      price: '¥6,299',
      position: [3, 0, 2],
      color: '#f59e0b',
      type: 'watch'
    },
    {
      id: '4',
      name: 'AirPods Max',
      description: '高保真音频，主动降噪，空间音频技术。',
      price: '¥4,399',
      position: [-2, 0, -2],
      color: '#ef4444',
      type: 'headphones'
    },
    {
      id: '5',
      name: 'Canon EOS R5',
      description: '专业全画幅无反相机，4500万像素，8K视频录制。',
      price: '¥25,999',
      position: [2, 0, -2],
      color: '#1f2937',
      type: 'camera'
    }
  ], []);

  const handleProductSelect = useCallback((id: string) => {
    setSelectedProduct(selectedProduct === id ? null : id);
  }, [selectedProduct]);

  const handleCloseInfo = useCallback(() => {
    setSelectedProduct(null);
  }, []);

  const selectedItem = useMemo(() => 
    products.find(item => item.id === selectedProduct) || null,
    [products, selectedProduct]
  );

  const cameraConfig = useMemo(() => ({
    position: [0, 3, 8] as [number, number, number],
    fov: 50
  }), []);

  const glConfig = useMemo(() => ({
    antialias: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance' as const
  }), []);

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-gray-100 to-gray-300">
      <Canvas
        camera={cameraConfig}
        shadows
        gl={glConfig}
        performance={{ min: 0.5 }}
      >
        {/* 展示环境 */}
        <DisplayPlatform />
        <ProductLighting />
        
        {/* 产品模型 */}
        {products.map((product) => (
          <ProductModel
            key={product.id}
            product={product}
            isSelected={selectedProduct === product.id}
            onSelect={handleProductSelect}
          />
        ))}
        
        {/* 相机控制 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={15}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2.2}
        />
        
        {/* 环境贴图 */}
        <Environment preset="studio" />
      </Canvas>
      
      {/* 产品信息面板 */}
      <ProductInfoPanel selectedProduct={selectedItem} onClose={handleCloseInfo} />
      
      {/* 控制提示 */}
      <div className="absolute bottom-4 left-4 text-gray-700 text-sm bg-white bg-opacity-80 p-3 rounded-lg shadow">
        <p>🖱️ 拖拽旋转视角</p>
        <p>🔍 滚轮缩放</p>
        <p>👆 点击产品查看详情</p>
      </div>
      
      {/* 标题 */}
      <div className="absolute top-4 left-4 text-gray-800">
        <h2 className="text-2xl font-bold mb-2">产品可视化展示</h2>
        <p className="text-gray-600">360度查看产品细节</p>
      </div>
    </div>
  );
};

export default ProductVisualization;