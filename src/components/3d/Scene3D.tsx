import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Stats } from '@react-three/drei';
import { Suspense } from 'react';
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
  return (
    <div className={className}>
      <Canvas
        camera={{ position: cameraPosition, fov: 75 }}
        shadows
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: ACESFilmicToneMapping,
          outputColorSpace: SRGBColorSpace
        }}
        performance={{ min: 0.5 }}
        frameloop="demand"
      >
        <Suspense fallback={null}>
          {/* 环境光照 */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
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
            opacity={0.75}
            scale={10}
            blur={2.5}
            far={4}
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