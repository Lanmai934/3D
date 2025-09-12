import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Raycaster, Mesh } from 'three';

// 鼠标跟踪hook
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
};

// 3D对象悬停检测
export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<Mesh>(null!);

  const onPointerOver = () => {
    setIsHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const onPointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default';
  };

  return {
    meshRef,
    isHovered,
    onPointerOver,
    onPointerOut,
  };
};

// 3D对象点击检测
export const useClick = (onClick?: () => void) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick?.();
    setTimeout(() => setIsClicked(false), 200);
  };

  return {
    isClicked,
    onClick: handleClick,
  };
};

// 相机跟随鼠标
export const useCameraFollow = (intensity: number = 0.1) => {
  const { camera } = useThree();
  const mousePosition = useMousePosition();

  useFrame(() => {
    if (camera) {
      camera.position.x += (mousePosition.x * intensity - camera.position.x) * 0.05;
      camera.position.y += (mousePosition.y * intensity - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0);
    }
  });
};

// 视差效果
export const useParallax = (factor: number = 1) => {
  const ref = useRef<Mesh>(null!);
  const { viewport, camera } = useThree();
  const mousePosition = useMousePosition();

  useFrame(() => {
    if (ref.current) {
      ref.current.position.x = (mousePosition.x * viewport.width * factor) / 4;
      ref.current.position.y = (mousePosition.y * viewport.height * factor) / 4;
    }
  });

  return ref;
};

// 3D射线检测
export const useRaycast = () => {
  const { camera, scene } = useThree();
  const raycaster = new Raycaster();
  const [intersectedObjects, setIntersectedObjects] = useState<Mesh[]>([]);

  const raycast = (mousePosition: { x: number; y: number }) => {
    raycaster.setFromCamera(mousePosition, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    const meshes = intersects
      .map(intersect => intersect.object)
      .filter(obj => obj instanceof Mesh) as Mesh[];
    
    setIntersectedObjects(meshes);
    return meshes;
  };

  return { raycast, intersectedObjects };
};

// 自动旋转控制
export const useAutoRotate = (speed: number = 1, enabled: boolean = true) => {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current && enabled) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * speed;
    }
  });

  return meshRef;
};

// 弹性动画
export const useSpring = (
  targetPosition: Vector3,
  stiffness: number = 0.1,
  damping: number = 0.9
) => {
  const meshRef = useRef<Mesh>(null!);
  const velocity = useRef(new Vector3());

  useFrame(() => {
    if (meshRef.current) {
      const current = meshRef.current.position;
      const force = targetPosition.clone().sub(current).multiplyScalar(stiffness);
      
      velocity.current.add(force);
      velocity.current.multiplyScalar(damping);
      
      current.add(velocity.current);
    }
  });

  return meshRef;
};