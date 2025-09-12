import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points } from 'three';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  radius?: number;
}

const ParticleField = ({ count = 1000, radius = 10 }: ParticleFieldProps) => {
  // 动态粒子数量控制，根据设备性能调整
  const [dynamicCount, setDynamicCount] = useState(count);
  
  useEffect(() => {
    // 检测设备性能并调整粒子数量
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (gl) {
      const renderer = gl.getParameter(gl.RENDERER);
      const isMobile = /Mobile|Android|iPhone|iPad/.test(navigator.userAgent);
      const isLowEnd = renderer && renderer.includes('Intel');
      
      let adjustedCount = count;
      if (isMobile) {
        adjustedCount = Math.min(count * 0.3, 300); // 移动设备减少70%
      } else if (isLowEnd) {
        adjustedCount = Math.min(count * 0.5, 500); // 低端设备减少50%
      }
      
      setDynamicCount(Math.floor(adjustedCount));
    }
  }, [count]);
  const pointsRef = useRef<Points>(null!);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(dynamicCount * 3);
    const colors = new Float32Array(dynamicCount * 3);
    
    for (let i = 0; i < dynamicCount; i++) {
      // 随机位置
      positions[i * 3] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 1] = (Math.random() - 0.5) * radius * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * radius * 2;
      
      // 随机颜色（蓝色调）
      const color = new THREE.Color();
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    return { positions, colors };
  }, [dynamicCount, radius]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={dynamicCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={dynamicCount}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ParticleField;