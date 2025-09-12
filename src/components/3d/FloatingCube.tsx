import { useRef } from 'react';
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

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // 旋转动画
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.5;
      meshRef.current.rotation.y = time * 0.3;
      
      // 浮动动画
      meshRef.current.position.y = position[1] + Math.sin(time) * 0.3;
    }
    
    // 文字跟随旋转
    if (textRef.current) {
      textRef.current.rotation.y = time * 0.2;
      textRef.current.position.y = position[1] + Math.sin(time) * 0.3 + 2;
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
        position={[position[0], position[1] + 2, position[2]]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Inter-Bold.woff"
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