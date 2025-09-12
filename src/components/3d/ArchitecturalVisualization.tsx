import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Box, Plane, Text, Environment, Sky } from '@react-three/drei';
import { 
  Group,
  DoubleSide,
  BufferGeometry,
  LineBasicMaterial,
  EdgesGeometry,
  LineSegments,
  PlaneGeometry,
  createOptimizedGeometry
} from '../../utils/threeShared';
import { 
  motion, 
  AnimatePresence,
  MOTION_VARIANTS,
  MOTION_TRANSITIONS,
  MOTION_GESTURES,
  createDelayedAnimation
} from '../../utils/motionShared';
import { usePerformanceOptimization } from '../../utils/performanceOptimizer';

// 建筑视图类型
type ViewMode = 'exterior' | 'interior' | 'blueprint' | 'landscape';

// 建筑信息接口
interface BuildingInfo {
  id: string;
  name: string;
  type: string;
  area: string;
  floors: number;
  year: string;
  architect: string;
  description: string;
  features: string[];
}

// 房间信息接口
interface RoomInfo {
  id: string;
  name: string;
  area: string;
  function: string;
  materials: string[];
  lighting: string;
}

// 3D建筑主体组件
const BuildingStructure: React.FC<{ viewMode: ViewMode; onRoomClick: (room: RoomInfo) => void }> = React.memo(({ viewMode, onRoomClick }) => {
  const buildingRef = useRef<Group>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  useFrame(() => {
    if (buildingRef.current && viewMode === 'exterior') {
      buildingRef.current.rotation.y += 0.0015; // 减慢旋转速度
    }
  });

  // 房间数据缓存
  const rooms = useMemo((): RoomInfo[] => [
    {
      id: 'living',
      name: '客厅',
      area: '45㎡',
      function: '休闲娱乐',
      materials: ['实木地板', '石膏吊顶', '乳胶漆墙面'],
      lighting: '自然采光 + LED筒灯'
    },
    {
      id: 'kitchen',
      name: '厨房',
      area: '12㎡',
      function: '烹饪用餐',
      materials: ['瓷砖地面', '石英石台面', '不锈钢橱柜'],
      lighting: '吊灯 + 橱柜灯带'
    },
    {
      id: 'bedroom',
      name: '主卧',
      area: '20㎡',
      function: '休息睡眠',
      materials: ['复合地板', '壁纸墙面', '石膏线条'],
      lighting: '主灯 + 床头灯'
    },
    {
      id: 'bathroom',
      name: '卫生间',
      area: '8㎡',
      function: '洗浴清洁',
      materials: ['防滑瓷砖', '防水涂料', '钢化玻璃'],
      lighting: '防水吸顶灯'
    }
  ], []);

  const getRoomColor = useCallback((roomId: string) => {
    const colors = {
      living: '#4a90e2',
      kitchen: '#f39c12',
      bedroom: '#9b59b6',
      bathroom: '#1abc9c'
    };
    return colors[roomId as keyof typeof colors] || '#95a5a6';
  }, []);

  const getRoomOpacity = useCallback((roomId: string) => {
    if (viewMode === 'blueprint') return 0.1;
    if (viewMode === 'interior') return hoveredRoom === roomId ? 0.8 : 0.6;
    return hoveredRoom === roomId ? 0.9 : 0.7;
  }, [viewMode, hoveredRoom]);

  return (
    <group ref={buildingRef}>
      {/* 建筑外墙 */}
      {viewMode === 'exterior' && (
        <>
          {/* 主体建筑 */}
          <Box args={[8, 6, 6]} position={[0, 3, 0]}>
            <meshStandardMaterial color="#ecf0f1" transparent opacity={0.9} />
          </Box>
          
          {/* 屋顶 */}
          <Box args={[9, 0.5, 7]} position={[0, 6.25, 0]}>
            <meshStandardMaterial color="#34495e" />
          </Box>
          
          {/* 窗户 */}
          {[-2, 0, 2].map((x, i) => (
            <Box key={i} args={[1.2, 1.5, 0.1]} position={[x, 4, 3.1]}>
              <meshStandardMaterial color="#3498db" transparent opacity={0.7} />
            </Box>
          ))}
          
          {/* 门 */}
          <Box args={[1, 2.5, 0.1]} position={[0, 1.25, 3.1]}>
            <meshStandardMaterial color="#8b4513" />
          </Box>
        </>
      )}
      
      {/* 室内布局 */}
      {(viewMode === 'interior' || viewMode === 'blueprint') && (
        <>
          {/* 地面 */}
          <Plane args={[8, 6]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#f8f9fa" />
          </Plane>
          
          {/* 房间区域 */}
          {/* 客厅 */}
          <Box
            args={[3.5, 0.1, 3]}
            position={[-1.25, 0.05, 1]}
            onClick={() => onRoomClick(rooms[0])}
            onPointerOver={() => setHoveredRoom('living')}
            onPointerOut={() => setHoveredRoom(null)}
          >
            <meshStandardMaterial
              color={getRoomColor('living')}
              transparent
              opacity={getRoomOpacity('living')}
            />
          </Box>
          
          {/* 厨房 */}
          <Box
            args={[2, 0.1, 2]}
            position={[2.5, 0.05, 2]}
            onClick={() => onRoomClick(rooms[1])}
            onPointerOver={() => setHoveredRoom('kitchen')}
            onPointerOut={() => setHoveredRoom(null)}
          >
            <meshStandardMaterial
              color={getRoomColor('kitchen')}
              transparent
              opacity={getRoomOpacity('kitchen')}
            />
          </Box>
          
          {/* 主卧 */}
          <Box
            args={[3, 0.1, 2.5]}
            position={[1, 0.05, -1.25]}
            onClick={() => onRoomClick(rooms[2])}
            onPointerOver={() => setHoveredRoom('bedroom')}
            onPointerOut={() => setHoveredRoom(null)}
          >
            <meshStandardMaterial
              color={getRoomColor('bedroom')}
              transparent
              opacity={getRoomOpacity('bedroom')}
            />
          </Box>
          
          {/* 卫生间 */}
          <Box
            args={[1.5, 0.1, 1.5]}
            position={[-2.75, 0.05, -1.25]}
            onClick={() => onRoomClick(rooms[3])}
            onPointerOver={() => setHoveredRoom('bathroom')}
            onPointerOut={() => setHoveredRoom(null)}
          >
            <meshStandardMaterial
              color={getRoomColor('bathroom')}
              transparent
              opacity={getRoomOpacity('bathroom')}
            />
          </Box>
          
          {/* 墙体线条 */}
          {viewMode === 'blueprint' && (
            <>
              {/* 外墙 */}
              <lineSegments>
                <edgesGeometry args={[createOptimizedGeometry.plane(8, 6)]} />
                <lineBasicMaterial color="#2c3e50" linewidth={2} />
              </lineSegments>
              
              {/* 房间标签 */}
              <Text
                position={[-1.25, 0.2, 1]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.3}
                color="#2c3e50"
                anchorX="center"
                anchorY="middle"
              >
                客厅
              </Text>
              
              <Text
                position={[2.5, 0.2, 2]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.3}
                color="#2c3e50"
                anchorX="center"
                anchorY="middle"
              >
                厨房
              </Text>
              
              <Text
                position={[1, 0.2, -1.25]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.3}
                color="#2c3e50"
                anchorX="center"
                anchorY="middle"
              >
                主卧
              </Text>
              
              <Text
                position={[-2.75, 0.2, -1.25]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.3}
                color="#2c3e50"
                anchorX="center"
                anchorY="middle"
              >
                卫生间
              </Text>
            </>
          )}
        </>
      )}
      
      {/* 景观环境 */}
      {viewMode === 'landscape' && (
        <>
          {/* 建筑简化版 */}
          <Box args={[6, 4, 4]} position={[0, 2, 0]}>
            <meshStandardMaterial color="#bdc3c7" transparent opacity={0.8} />
          </Box>
          
          {/* 树木 */}
          {[-8, -6, 6, 8].map((x, i) => (
            <group key={i} position={[x, 0, Math.random() * 4 - 2]}>
              {/* 树干 */}
              <Box args={[0.3, 3, 0.3]} position={[0, 1.5, 0]}>
                <meshStandardMaterial color="#8b4513" />
              </Box>
              {/* 树冠 */}
              <Box args={[2, 2, 2]} position={[0, 4, 0]}>
                <meshStandardMaterial color="#27ae60" />
              </Box>
            </group>
          ))}
          
          {/* 草地 */}
          <Plane args={[30, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <meshStandardMaterial color="#2ecc71" />
          </Plane>
          
          {/* 道路 */}
          <Plane args={[20, 2]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 8]}>
            <meshStandardMaterial color="#34495e" />
          </Plane>
        </>
      )}
    </group>
  );
});

// 视图模式选择器
interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = React.memo(({ currentMode, onModeChange }) => {
  const modes = useMemo(() => [
    { id: 'exterior', name: '外观视图', icon: '🏢', description: '建筑外立面展示' },
    { id: 'interior', name: '室内布局', icon: '🏠', description: '内部空间规划' },
    { id: 'blueprint', name: '平面图', icon: '📐', description: '建筑平面设计' },
    { id: 'landscape', name: '景观视图', icon: '🌳', description: '周边环境展示' }
  ], []);

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="bg-black bg-opacity-70 rounded-lg p-4">
        <h3 className="text-white text-lg font-semibold mb-3">视图模式</h3>
        <div className="space-y-2">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                currentMode === mode.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-xl">{mode.icon}</span>
              <div className="text-left">
                <div className="font-medium">{mode.name}</div>
                <div className="text-xs opacity-75">{mode.description}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
});

// 建筑信息面板
interface BuildingInfoPanelProps {
  buildingInfo: BuildingInfo;
  selectedRoom: RoomInfo | null;
  onCloseRoom: () => void;
}

const BuildingInfoPanel: React.FC<BuildingInfoPanelProps> = React.memo(({ buildingInfo, selectedRoom, onCloseRoom }) => {
  const buildingDetails = useMemo(() => [
    { label: '建筑类型', value: buildingInfo.type },
    { label: '建筑面积', value: buildingInfo.area },
    { label: '楼层数', value: `${buildingInfo.floors}层` },
    { label: '建造年份', value: buildingInfo.year },
    { label: '设计师', value: buildingInfo.architect }
  ], [buildingInfo]);

  const roomDetails = useMemo(() => {
    if (!selectedRoom) return null;
    return [
      { label: '面积', value: selectedRoom.area },
      { label: '功能', value: selectedRoom.function },
      { label: '照明', value: selectedRoom.lighting }
    ];
  }, [selectedRoom]);

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="bg-black bg-opacity-80 text-white p-6 rounded-lg max-w-sm">
        <h2 className="text-xl font-bold mb-4">{buildingInfo.name}</h2>
        
        <div className="space-y-3 text-sm">
          {buildingDetails.map(({ label, value }) => (
            <div key={label} className="flex justify-between">
              <span className="text-gray-300">{label}:</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4">
          <h3 className="font-semibold mb-2">建筑特色</h3>
          <div className="flex flex-wrap gap-1">
            {buildingInfo.features.map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-600 bg-opacity-50 rounded text-xs"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <p className="mt-4 text-gray-300 text-sm">{buildingInfo.description}</p>
      </div>
      
      {/* 房间详情模态 */}
      <AnimatePresence>
        {selectedRoom && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="mt-4 bg-black bg-opacity-90 text-white p-4 rounded-lg"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold">{selectedRoom.name}</h3>
              <button
                onClick={onCloseRoom}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              {roomDetails?.map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-300">{label}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-3">
              <h4 className="font-semibold mb-1">装修材料</h4>
              <div className="flex flex-wrap gap-1">
                {selectedRoom.materials.map((material, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-600 bg-opacity-50 rounded text-xs"
                  >
                    {material}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// 性能监控组件 - 已禁用以避免在复杂场景中的误报
const PerformanceMonitor: React.FC = React.memo(() => {
  // 注释掉性能监控以避免在建筑可视化中的警告
  // const { gl, scene } = useThree();
  // const { startOptimization } = usePerformanceOptimization();

  // useEffect(() => {
  //   if (gl && scene) {
  //     startOptimization(gl, scene);
  //   }
  // }, [gl, scene, startOptimization]);

  return null;
});

// 主建筑可视化组件
const ArchitecturalVisualization: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('exterior');
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [isWireframe, setIsWireframe] = useState(false);
  const { isOptimized, performanceLevel } = usePerformanceOptimization();

  // 建筑信息数据 - 使用useMemo缓存
  const buildingInfo: BuildingInfo = useMemo(() => ({
    id: 'modern-house',
    name: '现代简约住宅',
    type: '独栋别墅',
    area: '280㎡',
    floors: 2,
    year: '2024',
    architect: '张建筑师',
    description: '采用现代简约设计理念，注重空间的开放性和功能性，融合了环保材料和智能家居系统。',
    features: ['节能环保', '智能家居', '开放式设计', '大面积采光', '现代简约']
  }), []);

  const handleModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setSelectedRoom(null);
  }, []);

  const handleRoomClick = useCallback((room: RoomInfo) => {
    setSelectedRoom(room);
  }, []);

  const handleCloseRoom = useCallback(() => {
    setSelectedRoom(null);
  }, []);

  const toggleWireframe = useCallback(() => {
    setIsWireframe(!isWireframe);
  }, [isWireframe]);

  // 缓存相机配置
  const cameraConfig = useMemo(() => ({
    position: getCameraPosition(),
    fov: 60
  }), [viewMode]);

  // 缓存WebGL配置
  const glConfig = useMemo(() => ({
    antialias: performanceLevel > 0.5,
    preserveDrawingBuffer: true,
    powerPreference: "high-performance" as const
  }), [performanceLevel]);

  const getCameraPosition = (): [number, number, number] => {
    switch (viewMode) {
      case 'exterior': return [10, 8, 10];
      case 'interior': return [0, 8, 8];
      case 'blueprint': return [0, 15, 0];
      case 'landscape': return [15, 10, 15];
      default: return [10, 8, 10];
    }
  };

  return (
    <div className="w-full h-screen relative bg-gradient-to-b from-sky-200 to-sky-50">
      {/* 3D场景 */}
      <Canvas
        camera={cameraConfig}
        gl={glConfig}
        performance={{ min: 0.5 }}
      >
        {/* 环境设置 */}
        {viewMode === 'landscape' ? (
          <Sky sunPosition={[100, 20, 100]} />
        ) : (
          <color attach="background" args={viewMode === 'blueprint' ? ['#f8f9fa'] : ['#87ceeb']} />
        )}
        
        <Environment preset={viewMode === 'interior' ? 'apartment' : 'city'} />
        
        {/* 照明 */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={isOptimized ? 2048 : 1024}
          shadow-mapSize-height={isOptimized ? 2048 : 1024}
        />
        <pointLight position={[-10, 10, -5]} intensity={0.5} color="#ffd700" />
        
        {/* 性能监控 */}
        <PerformanceMonitor />
        
        {/* 建筑结构 */}
        <BuildingStructure viewMode={viewMode} onRoomClick={handleRoomClick} />
        
        {/* 相机控制 */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 2, 0]}
        />
      </Canvas>
      
      {/* UI控制面板 */}
      <ViewModeSelector currentMode={viewMode} onModeChange={handleModeChange} />
      
      <BuildingInfoPanel
        buildingInfo={buildingInfo}
        selectedRoom={selectedRoom}
        onCloseRoom={handleCloseRoom}
      />
      
      {/* 工具栏 */}
      <div className="absolute bottom-4 left-4 flex space-x-2">
        <motion.button
          onClick={toggleWireframe}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isWireframe
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isWireframe ? '🔲 线框模式' : '🏗️ 实体模式'}
        </motion.button>
      </div>
      
      {/* 操作指南 */}
      <div className="absolute bottom-4 right-4 text-gray-700 text-sm bg-white bg-opacity-80 p-3 rounded-lg max-w-xs">
        <p className="mb-2">🎮 <strong>操作指南:</strong></p>
        <p>• 拖拽旋转视角</p>
        <p>• 滚轮缩放</p>
        <p>• 切换视图模式</p>
        <p>• 点击房间查看详情</p>
      </div>
      
      {/* 标题信息 */}
      <div className="absolute top-4 center-4 text-center text-gray-800">
        <h2 className="text-2xl font-bold mb-1">建筑可视化</h2>
        <p className="text-blue-600">3D建筑设计展示系统</p>
        <div className="mt-2 text-sm text-gray-600">
          当前视图: {viewMode === 'exterior' ? '外观视图' :
                    viewMode === 'interior' ? '室内布局' :
                    viewMode === 'blueprint' ? '平面图' : '景观视图'}
        </div>
      </div>
    </div>
  );
};

export default ArchitecturalVisualization;