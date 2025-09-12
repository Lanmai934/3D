import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stats } from '@react-three/drei';
import { Suspense, useMemo } from 'react';
import { ACESFilmicToneMapping, SRGBColorSpace } from 'three';

interface Scene3DProps {
  children: React.ReactNode;
  enableControls?: boolean;
  showEnvironment?: boolean;
  cameraPosition?: [number, number, number];
  className?: string;
}

const Scene3D = ({ 
  children, 
  enableControls = true, 
  showEnvironment = true,
  cameraPosition = [0, 0, 5],
  className = "h-screen w-full"
}: Scene3DProps) => {
  // 缓存相机配置以避免重复创建
  const cameraConfig = useMemo(() => ({
    position: cameraPosition,
    fov: 75,
    near: 0.1,
    far: 1000
  }), [cameraPosition]);
  
  // 缓存GL配置以提高性能
  const glConfig = useMemo(() => ({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance' as const,
    toneMapping: ACESFilmicToneMapping,
    outputColorSpace: SRGBColorSpace,
    preserveDrawingBuffer: false,
    logarithmicDepthBuffer: false,
    precision: 'highp' as const
  }), []);
  return (
    <div className={className}>
      <Canvas
        camera={cameraConfig}
        shadows
        dpr={[1, 2]}
        gl={glConfig}
        performance={{ min: 0.5, max: 1, debounce: 200 }}
        frameloop="demand"
        resize={{ scroll: false, debounce: { scroll: 50, resize: 0 } }}
      >
        <Suspense fallback={null}>
          {/* 环境光照 */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            shadow-camera-near={1}
            shadow-camera-far={50}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          
          {/* 环境贴图 */}
          {showEnvironment && (
            <Environment
              preset="city"
              background={false}
            />
          )}
          
          {/* 地面阴影 */}
          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.5}
            scale={8}
            blur={1.5}
            far={3}
            resolution={512}
            frames={1}
          />
          
          {/* 性能统计 */}
          {process.env.NODE_ENV === 'development' && <Stats />}
          
          {/* 3D内容 */}
          {children}
          
          {/* 相机控制 */}
          {enableControls && (
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={2}
              maxDistance={20}
              autoRotate={false}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Scene3D;