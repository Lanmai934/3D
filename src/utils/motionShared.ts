// Framer Motion 共享模块 - 统一管理常用的动画组件和配置
// 避免在多个文件中重复导入相同的 framer-motion 模块

// 核心组件
export {
  motion,
  AnimatePresence
} from 'framer-motion';

// 类型定义
export type {
  Variants,
  Transition,
  MotionProps,
  AnimationControls
} from 'framer-motion';

// 常用动画变体
export const MOTION_VARIANTS = {
  // 淡入淡出
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  
  // 从下方滑入
  slideUp: {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 }
  },
  
  // 从左侧滑入
  slideLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 }
  },
  
  // 从右侧滑入
  slideRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 }
  },
  
  // 缩放动画
  scale: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
  },
  
  // 旋转动画
  rotate: {
    hidden: { opacity: 0, rotate: -10 },
    visible: { opacity: 1, rotate: 0 }
  },
  
  // 弹跳动画
  bounce: {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  },
  
  // 容器动画（用于列表项）
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  },
  
  // 列表项动画
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }
} as const;

// 常用过渡配置
export const MOTION_TRANSITIONS = {
  // 快速过渡
  fast: {
    duration: 0.3,
    ease: "easeOut"
  },
  
  // 标准过渡
  standard: {
    duration: 0.6,
    ease: "easeInOut"
  },
  
  // 慢速过渡
  slow: {
    duration: 1.0,
    ease: "easeInOut"
  },
  
  // 弹性过渡
  spring: {
    type: "spring",
    stiffness: 100,
    damping: 10
  },
  
  // 平滑弹性
  smoothSpring: {
    type: "spring",
    stiffness: 300,
    damping: 30
  }
} as const;

// 常用手势配置
export const MOTION_GESTURES = {
  // 悬停效果
  hover: {
    scale: 1.05,
    transition: MOTION_TRANSITIONS.fast
  },
  
  // 点击效果
  tap: {
    scale: 0.95,
    transition: MOTION_TRANSITIONS.fast
  },
  
  // 悬停上升
  hoverUp: {
    y: -10,
    transition: MOTION_TRANSITIONS.standard
  },
  
  // 悬停发光
  hoverGlow: {
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
    transition: MOTION_TRANSITIONS.standard
  }
} as const;

// 页面过渡动画
export const PAGE_TRANSITIONS = {
  // 页面淡入
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: MOTION_TRANSITIONS.standard
  },
  
  // 页面滑动
  pageSlide: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: MOTION_TRANSITIONS.standard
  }
} as const;

// 创建延迟动画的工具函数
export const createDelayedAnimation = (delay: number, variants = MOTION_VARIANTS.slideUp) => ({
  ...variants,
  visible: {
    ...variants.visible,
    transition: {
      ...MOTION_TRANSITIONS.standard,
      delay
    }
  }
});

// 创建交错动画的工具函数
export const createStaggeredAnimation = (staggerDelay = 0.1) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1
      }
    }
  },
  item: MOTION_VARIANTS.slideUp
});