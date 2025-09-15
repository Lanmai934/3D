import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, Raycaster, Mesh } from 'three';

/**
 * 鼠标位置跟踪Hook
 * 将屏幕坐标转换为标准化设备坐标 (NDC)
 * @returns {object} 包含x和y坐标的对象，范围为[-1, 1]
 */
export const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
      // 将屏幕坐标转换为标准化设备坐标 (NDC)
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,  // X轴：[-1, 1]
        y: -(e.clientY / window.innerHeight) * 2 + 1, // Y轴：[-1, 1]，注意Y轴翻转
      });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return mousePosition;
};

/**
 * 3D对象悬停检测Hook
 * 提供鼠标悬停状态管理和光标样式控制
 * @returns {object} 包含meshRef、悬停状态和事件处理函数
 */
export const useHover = () => {
  const [isHovered, setIsHovered] = useState(false);
  const meshRef = useRef<Mesh>(null!);

  // 鼠标进入时的处理
  const onPointerOver = () => {
    setIsHovered(true);
    document.body.style.cursor = 'pointer'; // 改变光标样式
  };

  // 鼠标离开时的处理
  const onPointerOut = () => {
    setIsHovered(false);
    document.body.style.cursor = 'default'; // 恢复默认光标
  };

  return {
    meshRef,
    isHovered,
    onPointerOver,
    onPointerOut,
  };
};

/**
 * 3D对象点击检测Hook
 * 管理点击状态并执行回调函数
 * @param {Function} onClick - 点击时执行的回调函数
 * @returns {object} 包含点击状态和点击处理函数
 */
export const useClick = (onClick?: () => void) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onClick?.(); // 执行回调函数
    // 200ms后重置点击状态，用于视觉反馈
    setTimeout(() => setIsClicked(false), 200);
  };

  return {
    isClicked,
    onClick: handleClick,
  };
};

/**
 * 相机跟随鼠标Hook
 * 使相机根据鼠标位置进行平滑移动
 * @param {number} intensity - 跟随强度，默认0.1
 */
export const useCameraFollow = (intensity: number = 0.1) => {
  const { camera } = useThree();
  const mousePosition = useMousePosition();

  useFrame(() => {
    if (camera) {
      // 使用线性插值实现平滑的相机移动
      camera.position.x += (mousePosition.x * intensity - camera.position.x) * 0.05;
      camera.position.y += (mousePosition.y * intensity - camera.position.y) * 0.05;
      camera.lookAt(0, 0, 0); // 始终看向原点
    }
  });
};

/**
 * 视差效果Hook
 * 根据鼠标位置创建视差移动效果
 * @param {number} factor - 视差强度因子，默认1
 * @returns {RefObject} 3D对象的引用
 */
export const useParallax = (factor: number = 1) => {
  const ref = useRef<Mesh>(null!);
  const { viewport } = useThree();
  const mousePosition = useMousePosition();

  useFrame(() => {
    if (ref.current) {
      // 根据视口大小和鼠标位置计算视差偏移
      ref.current.position.x = (mousePosition.x * viewport.width * factor) / 4;
      ref.current.position.y = (mousePosition.y * viewport.height * factor) / 4;
    }
  });

  return ref;
};

/**
 * 3D射线检测Hook
 * 用于检测射线与3D对象的交集
 * @returns {object} 包含射线检测函数和相交对象数组
 */
export const useRaycast = () => {
  const { scene } = useThree();
  const raycaster = new Raycaster();
  const [intersectedObjects, setIntersectedObjects] = useState<Mesh[]>([]);

  const raycast = () => {
    // TODO: 需要传入鼠标位置和相机参数
    // raycaster.setFromCamera(mousePosition, camera);
    
    // 检测射线与场景中所有对象的交集
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // 过滤出Mesh类型的对象
    const meshes = intersects
      .map(intersect => intersect.object)
      .filter(obj => obj instanceof Mesh) as Mesh[];
    
    setIntersectedObjects(meshes);
    return meshes;
  };

  return { raycast, intersectedObjects };
};

/**
 * 自动旋转控制Hook
 * 为3D对象添加持续的旋转动画
 * @param {number} speed - 旋转速度，默认1
 * @param {boolean} enabled - 是否启用旋转，默认true
 * @returns {RefObject} 3D对象的引用
 */
export const useAutoRotate = (speed: number = 1, enabled: boolean = true) => {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current && enabled) {
      // 基于时间的连续旋转动画
      meshRef.current.rotation.y = state.clock.getElapsedTime() * speed;
    }
  });

  return meshRef;
};

/**
 * 弹性动画Hook
 * 使3D对象以弹性动画方式移动到目标位置
 * @param {Vector3} targetPosition - 目标位置
 * @param {number} stiffness - 弹性系数，默认0.1
 * @param {number} damping - 阻尼系数，默认0.9
 * @returns {RefObject} 3D对象的引用
 */
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
      // 计算弹性力：目标位置与当前位置的差值乘以弹性系数
      const force = targetPosition.clone().sub(current).multiplyScalar(stiffness);
      
      // 应用力到速度
      velocity.current.add(force);
      // 应用阻尼减少速度
      velocity.current.multiplyScalar(damping);
      
      // 更新位置
      current.add(velocity.current);
    }
  });

  return meshRef;
};