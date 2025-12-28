import { useState, useEffect, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { revealAnimation } from '@/lib/animations';

interface RevealProps {
  children: ReactNode;
  className?: string;
  animation?: 'fadeUp' | 'fadeIn' | 'scaleUp' | 'slideRight' | 'slideLeft' | 'staggered' | 'none';
  delay?: 'none' | 'short' | 'medium' | 'long' | 'longer' | 'longest';
  threshold?: number;
  once?: boolean;
}

/**
 * Reveal Component
 * 
 * Animates its children into view when they enter the viewport during scrolling.
 * 
 * @param children - Content to be revealed with animation
 * @param className - Additional CSS classes
 * @param animation - Type of entrance animation
 * @param delay - Delay before starting the animation
 * @param threshold - Portion of element that must be visible to trigger animation (0-1)
 * @param once - If true, animation only happens once and won't replay if element leaves and re-enters viewport
 */
const Reveal = ({
  children,
  className,
  animation = 'fadeUp',
  delay = 'none',
  threshold = 0.1,
  once = true,
}: RevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If set to animate only once and already animated, do nothing
        if (once && hasAnimated) return;
        
        // Update visibility state based on intersection
        setIsVisible(entry.isIntersecting);
        
        // If element became visible and this is the first time, mark as animated
        if (entry.isIntersecting && !hasAnimated && once) {
          setHasAnimated(true);
        }
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: threshold,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, once, hasAnimated]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all',
        // Only apply animation class if isVisible is true
        isVisible && revealAnimation({ animation, delay }),
        // Hide completely if not visible yet and no delay (prevents flash before animation)
        !isVisible && animation !== 'none' && delay === 'none' && 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
};

export { Reveal };