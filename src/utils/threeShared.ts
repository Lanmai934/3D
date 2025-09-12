// THREE.js 共享模块 - 统一管理常用的 THREE.js 导入
// 避免在多个文件中重复导入相同的 THREE.js 模块

// 导入 THREE 命名空间
import * as THREE from 'three';

// 核心类型和常量
export {
  Mesh,
  Group,
  Vector3,
  Color,
  DoubleSide,
  Points,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  MeshStandardMaterial,
  MeshBasicMaterial,
  LineBasicMaterial,
  SphereGeometry,
  BoxGeometry,
  PlaneGeometry,
  RingGeometry,
  CylinderGeometry,
  LineSegments,
  EdgesGeometry,
  WebGLRenderer,
  Scene,
  Texture,
  PCFSoftShadowMap,
  ACESFilmicToneMapping
} from 'three';

// 数学工具
export {
  MathUtils
} from 'three';

// 类型定义
export type {
  Object3D
} from 'three';

// 常用常量
export const THREE_CONSTANTS = {
  DoubleSide: 2, // THREE.DoubleSide 的值
  PI: Math.PI,
  PI2: Math.PI * 2,
  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI
} as const;

// 常用颜色预设
export const COMMON_COLORS = {
  WHITE: '#ffffff',
  BLACK: '#000000',
  RED: '#ff0000',
  GREEN: '#00ff00',
  BLUE: '#0000ff',
  YELLOW: '#ffff00',
  CYAN: '#00ffff',
  MAGENTA: '#ff00ff',
  GRAY: '#808080'
} as const;

// 性能优化的几何体创建函数
export const createOptimizedGeometry = {
  sphere: (radius = 1, widthSegments = 16, heightSegments = 16) => 
    new THREE.SphereGeometry(radius, widthSegments, heightSegments),
  
  box: (width = 1, height = 1, depth = 1) => 
    new THREE.BoxGeometry(width, height, depth),
  
  plane: (width = 1, height = 1) => 
    new THREE.PlaneGeometry(width, height),
  
  ring: (innerRadius = 0.5, outerRadius = 1, thetaSegments = 32) => 
    new THREE.RingGeometry(innerRadius, outerRadius, thetaSegments)
};

// 常用材质创建函数
export const createOptimizedMaterial = {
  standard: (options: any = {}) => new THREE.MeshStandardMaterial(options),
  basic: (options: any = {}) => new THREE.MeshBasicMaterial(options),
  points: (options: any = {}) => new THREE.PointsMaterial(options),
  line: (options: any = {}) => new THREE.LineBasicMaterial(options)
};