import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';

interface FloatingCubeProps {
  position?: [number, number, number];
  color?: string;
  text?: string;
}

const FloatingCube = ({ 
  position = [0, 0, 0], 
  color = '#3b82f6',
  text = '3D'
}: FloatingCubeProps) => {
  const meshRef = useRef<Mesh>(null!);
  const textRef = useRef<Mesh>(null!);
  
  // 缓存计算值以提高性能
  const basePosition = useMemo(() => position, [position[0], position[1], position[2]]);
  const textPosition = useMemo(() => [position[0], position[1] + 2, position[2]] as [number, number, number], [position[0], position[1], position[2]]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // 优化动画计算，减少重复计算
    const floatOffset = Math.sin(time) * 0.3;
    
    // 旋转动画
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.5;
      meshRef.current.rotation.y = time * 0.3;
      
      // 浮动动画
      meshRef.current.position.y = basePosition[1] + floatOffset;
    }
    
    // 文字跟随旋转，降低旋转频率以提高性能
    if (textRef.current) {
      textRef.current.rotation.y = time * 0.1; // 减少旋转速度
      textRef.current.position.y = basePosition[1] + floatOffset + 2;
    }
  });

  return (
    <group>
      {/* 立方体 */}
      <mesh
        ref={meshRef}
        position={position}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* 3D文字 */}
      <Text
        ref={textRef}
        position={textPosition}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={200}
        lineHeight={1}
        letterSpacing={0.02}
        textAlign="center"
        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
      >
        {text}
      </Text>
      
      {/* 发光效果 */}
      <mesh position={position}>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>
    </group>
  );
};

export default FloatingCube;