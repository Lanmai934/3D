import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls, shaderMaterial } from '@react-three/drei';
import { 
  Vector2, 
  ShaderMaterial, 
  Texture, 
  DataTexture, 
  RGBAFormat, 
  FloatType,
  Mesh,
  PlaneGeometry,
  WebGLRenderTarget,
  Scene,
  Camera,
  OrthographicCamera
} from 'three';
import { motion } from 'framer-motion';

// 花朵着色器材质
const FlowerShaderMaterial = shaderMaterial(
  // Uniforms
  {
    u_ratio: 1.0,
    u_cursor: new Vector2(0.5, 0.5),
    u_stop_time: 0.0,
    u_clean: 1.0,
    u_stop_randomizer: new Vector2(0.5, 0.5),
    u_texture: null as Texture | null,
    u_time: 0.0,
    u_completed_flowers: null as DataTexture | null,
    u_flower_count: 0,
  },
  // Vertex Shader顶点着色器
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  // Fragment Shader片元着色器
  `
    #define PI 3.14159265359
    
    uniform float u_ratio;
    uniform vec2 u_cursor;
    uniform float u_stop_time;
    uniform float u_clean;
    uniform vec2 u_stop_randomizer;
    uniform sampler2D u_texture;
    uniform float u_time;
    uniform sampler2D u_completed_flowers;
    uniform float u_flower_count;
    
    varying vec2 vUv;
    
    // 2D noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
      m = m*m;
      m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    float get_flower_shape(vec2 _p, float _pet_n, float _angle, float _outline) {
      _angle *= 3.0;
      
      _p = vec2(_p.x * cos(_angle) - _p.y * sin(_angle),
                _p.x * sin(_angle) + _p.y * cos(_angle));
      
      float a = atan(_p.y, _p.x);
      float flower_sectoral_shape = pow(abs(sin(a * _pet_n)), 0.4) + 0.25;
      
      vec2 flower_size_range = vec2(0.03, 0.1);
      float size = flower_size_range[0] + u_stop_randomizer[0] * flower_size_range[1];
      
      float flower_radial_shape = pow(length(_p) / size, 2.0);
      flower_radial_shape -= 0.1 * sin(8.0 * a);
      flower_radial_shape = max(0.1, flower_radial_shape);
      flower_radial_shape += smoothstep(0.0, 0.03, -_p.y + 0.2 * abs(_p.x));
      
      float grow_time = step(0.25, u_stop_time) * pow(u_stop_time, 0.3);
      float flower_shape = 1.0 - smoothstep(0.0, flower_sectoral_shape, _outline * flower_radial_shape / grow_time);
      
      flower_shape *= (1.0 - step(1.0, grow_time));
      
      return flower_shape;
    }
    
    float get_stem_shape(vec2 _p, vec2 _uv, float _w, float _angle) {
      _w = max(0.004, _w);
      
      float x_offset = _p.y * sin(_angle);
      x_offset *= pow(3.0 * _uv.y, 2.0);
      _p.x -= x_offset;
      
      float noise_power = 0.5;
      float cursor_horizontal_noise = noise_power * snoise(2.0 * _uv * u_stop_randomizer[0]);
      cursor_horizontal_noise *= pow(dot(_p.y, _p.y), 0.6);
      cursor_horizontal_noise *= pow(dot(_uv.y, _uv.y), 0.3);
      _p.x += cursor_horizontal_noise;
      
      float left = smoothstep(-_w, 0.0, _p.x);
      float right = 1.0 - smoothstep(0.0, _w, _p.x);
      float stem_shape = left * right;
      
      // 修复茎的生长时间逻辑
      float grow_time = smoothstep(0.0, 0.5, u_stop_time);
      float stem_top_mask = smoothstep(0.0, grow_time, 0.15 - _p.y);
      stem_shape *= stem_top_mask;
      
      // 茎在整个动画过程中都应该可见
      stem_shape *= smoothstep(0.0, 0.1, u_stop_time);
      
      return stem_shape;
    }
    
    void main() {
      vec3 base = texture2D(u_texture, vUv).xyz;
      
      vec2 uv = vUv;
      uv.x *= u_ratio;
      
      vec3 color = base;
      
      // 渲染所有已完成的花朵
      for (int i = 0; i < int(u_flower_count) && i < 64; i++) {
        vec4 flowerData = texture2D(u_completed_flowers, vec2((float(i) + 0.5) / 64.0, 0.5));
        vec2 flowerPos = flowerData.xy;
        vec2 flowerRandomizer = flowerData.zw;
        
        // 只有当花朵位置有效时才渲染
        if (length(flowerPos) > 0.0) {
          // 临时保存当前的uniform值
          vec2 temp_cursor = u_cursor;
          float temp_stop_time = u_stop_time;
          vec2 temp_randomizer = u_stop_randomizer;
          
          // 设置已完成花朵的参数
          vec2 cursor = vUv - flowerPos;
          cursor.x *= u_ratio;
          
          vec3 stem_color = vec3(0.1 + flowerRandomizer[0] * 0.6, 0.6, 0.2);
          vec3 flower_color = vec3(0.6 + 0.5 * flowerRandomizer[1], 0.1, 0.9 - 0.5 * flowerRandomizer[1]);
          
          float angle = 0.5 * (flowerRandomizer[0] - 0.5);
          
          // 渲染已完成的花朵（完全绽放状态）
          float stem_shape = get_stem_shape(cursor, uv, 0.008, angle);
          stem_shape += get_stem_shape(cursor + vec2(0.0, 0.2 + 0.5 * flowerRandomizer[0]), uv, 0.008, angle);
          
          float petals_back_number = 1.0 + floor(flowerRandomizer[0] * 2.0);
          float petals_front_number = 2.0 + floor(flowerRandomizer[1] * 2.0);
          
          // 手动计算完全绽放的花朵形状
          float grow_time = 1.0; // 完全生长
          float flower_sectoral_shape_back = pow(abs(sin(atan(cursor.y, cursor.x) * petals_back_number)), 0.4) + 0.25;
          float flower_sectoral_shape_front = pow(abs(sin(atan(cursor.y, cursor.x) * petals_front_number)), 0.4) + 0.25;
          
          vec2 flower_size_range = vec2(0.03, 0.1);
          float size = flower_size_range[0] + flowerRandomizer[0] * flower_size_range[1];
          
          float flower_radial_shape = pow(length(cursor) / size, 2.0);
          flower_radial_shape -= 0.1 * sin(8.0 * atan(cursor.y, cursor.x));
          flower_radial_shape = max(0.1, flower_radial_shape);
          flower_radial_shape += smoothstep(0.0, 0.03, -cursor.y + 0.2 * abs(cursor.x));
          
          float flower_back_shape = 1.0 - smoothstep(0.0, flower_sectoral_shape_back, 1.5 * flower_radial_shape / grow_time);
          float flower_front_shape = 1.0 - smoothstep(0.0, flower_sectoral_shape_front, 1.0 * flower_radial_shape / grow_time);
          
          color += (stem_shape * stem_color);
          color += (flower_back_shape * (flower_color + vec3(0.0, 0.8, 0.0)));
          color += (flower_front_shape * flower_color);
        }
      }
      
      // 渲染当前正在生长的花朵
      if (u_stop_time > 0.0) {
        vec2 cursor = vUv - u_cursor.xy;
        cursor.x *= u_ratio;
        
        vec3 stem_color = vec3(0.1 + u_stop_randomizer[0] * 0.6, 0.6, 0.2);
        vec3 flower_color = vec3(0.6 + 0.5 * u_stop_randomizer[1], 0.1, 0.9 - 0.5 * u_stop_randomizer[1]);
        
        float angle = 0.5 * (u_stop_randomizer[0] - 0.5);
        
        float stem_shape = get_stem_shape(cursor, uv, 0.008, angle);
        stem_shape += get_stem_shape(cursor + vec2(0.0, 0.2 + 0.5 * u_stop_randomizer[0]), uv, 0.008, angle);
        float stem_mask = 1.0 - get_stem_shape(cursor, uv, 0.010, angle);
        stem_mask -= get_stem_shape(cursor + vec2(0.0, 0.2 + 0.5 * u_stop_randomizer[0]), uv, 0.010, angle);
        
        float petals_back_number = 1.0 + floor(u_stop_randomizer[0] * 2.0);
        float angle_offset = -(2.0 * step(0.0, angle) - 1.0) * 0.1 * u_stop_time;
        float flower_back_shape = get_flower_shape(cursor, petals_back_number, angle + angle_offset, 1.5);
        float flower_back_mask = 1.0 - get_flower_shape(cursor, petals_back_number, angle + angle_offset, 1.6);
        
        float petals_front_number = 2.0 + floor(u_stop_randomizer[1] * 2.0);
        float flower_front_shape = get_flower_shape(cursor, petals_front_number, angle, 1.0);
        float flower_front_mask = 1.0 - get_flower_shape(cursor, petals_front_number, angle, 0.95);
        
        color *= stem_mask;
        color *= flower_back_mask;
        color *= flower_front_mask;
        
        color += (stem_shape * stem_color);
        color += (flower_back_shape * (flower_color + vec3(0.0, 0.8 * u_stop_time, 0.0)));
        color += (flower_front_shape * flower_color);
        
        color.r *= 1.0 - (0.5 * flower_back_shape * flower_front_shape);
        color.b *= 1.0 - (flower_back_shape * flower_front_shape);
      }
      
      color *= u_clean;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

// 扩展材质到Three.js
extend({ FlowerShaderMaterial });

// 声明材质类型
declare global {
  namespace JSX {
    interface IntrinsicElements {
      flowerShaderMaterial: any;
    }
  }
}

// 花朵数据接口
interface FlowerData {
  id: string;
  position: Vector2;
  randomizer: Vector2;
  startTime: number;
  duration: number;
}

// 花朵画布组件
const FlowerCanvas: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const { size, viewport, clock } = useThree();
  
  const [flowers, setFlowers] = useState<FlowerData[]>([]);
  const [currentFlower, setCurrentFlower] = useState<FlowerData | null>(null);
  const [cleanFactor, setCleanFactor] = useState(1.0);
  const [completedFlowers, setCompletedFlowers] = useState<FlowerData[]>([]);

  
  // 创建背景纹理
  const backgroundTexture = useMemo(() => {
    const width = 512;
    const height = 512;
    const data = new Uint8Array(width * height * 4);
    
    // 创建深色背景
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 20;     // R
      data[i + 1] = 25; // G
      data[i + 2] = 35; // B
      data[i + 3] = 255; // A
    }
    
    const texture = new DataTexture(data, width, height, RGBAFormat);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // 创建已完成花朵的纹理数据
  const completedFlowersTexture = useMemo(() => {
    const maxFlowers = 64; // 最多支持64朵花
    const data = new Float32Array(maxFlowers * 4); // 每朵花4个float值: x, y, randomizer.x, randomizer.y
    
    completedFlowers.forEach((flower, index) => {
      if (index < maxFlowers) {
        const baseIndex = index * 4;
        data[baseIndex] = flower.position.x;
        data[baseIndex + 1] = flower.position.y;
        data[baseIndex + 2] = flower.randomizer.x;
        data[baseIndex + 3] = flower.randomizer.y;
      }
    });
    
    const texture = new DataTexture(data, maxFlowers, 1, RGBAFormat, FloatType);
    texture.needsUpdate = true;
    return texture;
  }, [completedFlowers]);

  // 创建随机花朵的函数
  const createRandomFlower = useCallback(() => {
    const x = 0.1 + Math.random() * 0.8; // 在10%-90%范围内随机
    const y = 0.1 + Math.random() * 0.8; // 在10%-90%范围内随机
    
    const newFlower: FlowerData = {
      id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
      position: new Vector2(x, y),
      randomizer: new Vector2(Math.random(), Math.random()),
      startTime: 0, // 将在useFrame中设置
      duration: 3 + Math.random() * 2, // 3-5秒的随机持续时间
    };
    
    setFlowers(prev => [...prev, newFlower]);
    console.log('创建随机花朵:', newFlower);
  }, []);
  
  // 动画循环
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.u_ratio.value = state.viewport.width / state.viewport.height;
      materialRef.current.uniforms.u_clean.value = cleanFactor;


      
      // 找到最新的正在生长的花朵来显示动画
      const activeFlower = flowers
        .filter(flower => {
          const elapsed = state.clock.elapsedTime - flower.startTime;
          const progress = elapsed / flower.duration;
          return progress >= 0 && progress <= 1;
        })
        .sort((a, b) => b.startTime - a.startTime)[0]; // 获取最新的花朵
      
      if (activeFlower) {
        const elapsed = state.clock.elapsedTime - activeFlower.startTime;
        const progress = Math.min(Math.max(elapsed / activeFlower.duration, 0), 1);
        
        materialRef.current.uniforms.u_cursor.value = activeFlower.position;
        materialRef.current.uniforms.u_stop_time.value = progress;
        materialRef.current.uniforms.u_stop_randomizer.value = activeFlower.randomizer;
        
        setCurrentFlower(activeFlower);
      } else {
        // 没有活跃花朵时，重置uniform值
        materialRef.current.uniforms.u_stop_time.value = 0;
        setCurrentFlower(null);
      }
      
      // 更新已完成花朵的纹理数据
      materialRef.current.uniforms.u_completed_flowers.value = completedFlowersTexture;
      materialRef.current.uniforms.u_flower_count.value = completedFlowers.length;
      
      // 将完成的花朵移动到completedFlowers中
      setFlowers(prev => {
        const stillGrowing: FlowerData[] = [];
        const newlyCompleted: FlowerData[] = [];
        
        prev.forEach(flower => {
          // 如果花朵的startTime为0，设置为当前时间
          if (flower.startTime === 0) {
            flower.startTime = state.clock.elapsedTime;
          }
          
          const elapsed = state.clock.elapsedTime - flower.startTime;
          const progress = elapsed / flower.duration;
          
          if (progress >= 1.0) {
            // 花朵已完成，检查是否已经在completedFlowers中
            if (!completedFlowers.find(cf => cf.id === flower.id)) {
              newlyCompleted.push(flower);
            }
          } else if (progress >= 0) {
            // 花朵仍在生长
            stillGrowing.push(flower);
          }
        });
        
        // 添加新完成的花朵到completedFlowers
        if (newlyCompleted.length > 0) {
          console.log('新完成的花朵:', newlyCompleted);
          setCompletedFlowers(prevCompleted => {
            const updated = [...prevCompleted, ...newlyCompleted];
            console.log('已完成花朵总数:', updated.length);
            return updated;
          });
        }
        
        return stillGrowing;
      });
    }
  });
  
  // 处理点击事件
  const handleClick = useCallback((event: any) => {
    console.log('点击事件触发:', event);
    
    // 获取标准化的点击坐标 (0-1范围)
    let x, y;
    
    if (event.uv) {
      // 使用UV坐标
      x = event.uv.x;
      y = event.uv.y;
    } else if (event.point) {
      // 使用世界坐标转换为UV坐标
      const { viewport } = useThree();
      x = (event.point.x / viewport.width) * 0.5 + 0.5;
      y = (event.point.y / viewport.height) * 0.5 + 0.5;
    } else {
      // 添加一些随机偏移，确保花朵分散显示
      x = 0.3 + Math.random() * 0.4; // 在30%-70%范围内随机
      y = 0.3 + Math.random() * 0.4; // 在30%-70%范围内随机
    }
    
    // 确保坐标在有效范围内
    x = Math.max(0.1, Math.min(0.9, x));
    y = Math.max(0.1, Math.min(0.9, y));
    
    console.log('点击坐标:', { x, y });
    
    const newFlower: FlowerData = {
      id: Date.now().toString(),
      position: new Vector2(x, y),
      randomizer: new Vector2(Math.random(), Math.random()),
      startTime: clock.elapsedTime,
      duration: 3.0 + Math.random() * 2.0, // 3-5秒的生长时间
    };
    
    console.log('创建新花朵:', newFlower);
    
    setFlowers(prev => {
      const updated = [...prev, newFlower];
      console.log('更新花朵列表:', updated);
      return updated;
    });
    setCurrentFlower(newFlower);
  }, [clock]);
  
  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      position={[0, 0, 0]}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
      <flowerShaderMaterial
        ref={materialRef}
        u_texture={backgroundTexture}
        u_ratio={size.width / size.height}
        u_cursor={new Vector2(0.5, 0.5)}
        u_stop_time={0.0}
        u_clean={cleanFactor}
        u_stop_randomizer={new Vector2(0.5, 0.5)}
        u_time={0.0}
        u_completed_flowers={completedFlowersTexture}
        u_flower_count={0}
      />
    </mesh>
  );
};

// 主组件
const InteractiveFlowerCanvas: React.FC = () => {
  const [isClearing, setIsClearing] = useState(false);
  
  const handleClear = useCallback(() => {
    setIsClearing(true);
    setTimeout(() => {
      setIsClearing(false);
    }, 1000);
  }, []);
  
  return (
    <div className="relative w-full h-full bg-gray-900">
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <FlowerCanvas />
      </Canvas>
      
      {/* UI 控制 */}
      <div className="absolute top-4 left-4 space-y-4">
        <motion.button
          onClick={handleClear}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isClearing}
        >
          {isClearing ? '清理中...' : '清空画布'}
        </motion.button>
      </div>
      
      {/* 使用说明 */}
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🌸 点击添加花朵</h3>
        <p className="text-sm text-gray-300">
          • 点击画布任意位置生成花朵<br/>
          • 每朵花都有独特的形状和颜色<br/>
          • 观察花朵的生长动画效果
        </p>
      </div>
    </div>
  );
};

export default InteractiveFlowerCanvas;