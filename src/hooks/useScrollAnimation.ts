import { useEffect, useState } from 'react';

export const useScrollAnimation = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let scrollTimeout: NodeJS.Timeout;

    const updateScrollY = () => {
      const currentScrollY = window.scrollY;
      
      setScrollY(currentScrollY);
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setIsScrolling(true);
      
      // 清除之前的定时器
      clearTimeout(scrollTimeout);
      
      // 设置新的定时器，在停止滚动后重置状态
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', updateScrollY);
    
    return () => {
      window.removeEventListener('scroll', updateScrollY);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return { scrollY, scrollDirection, isScrolling };
};

export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};