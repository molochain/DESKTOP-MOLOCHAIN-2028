import React, { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface FloatProps {
  children: ReactNode;
  className?: string;
  amplitude?: number; // Floating distance in pixels
  frequency?: number; // Frequency of the floating cycle in seconds
  random?: boolean;   // Whether to randomize the floating pattern
  rotate?: boolean;   // Whether to add subtle rotation
  pause?: boolean;    // Whether to pause the animation on hover
}

/**
 * Float - Creates a subtle floating animation for elements
 * 
 * @param {ReactNode} children - Content to apply the floating effect to
 * @param {string} className - Additional CSS classes
 * @param {number} amplitude - Floating distance in pixels
 * @param {number} frequency - Frequency of the floating cycle in seconds
 * @param {boolean} random - Whether to randomize the floating pattern
 * @param {boolean} rotate - Whether to add subtle rotation
 * @param {boolean} pause - Whether to pause the animation on hover
 */
export const Float: React.FC<FloatProps> = ({
  children,
  className,
  amplitude = 10,
  frequency = 3,
  random = false,
  rotate = false,
  pause = true
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!elementRef.current || !random) return;
    
    // Each element gets a unique random offset to create a more organic feel
    const randomOffset = Math.random() * 2 * Math.PI;
    const randomPhase = Math.random() * 0.5 + 0.8; // Random phase between 0.8 and 1.3
    
    elementRef.current.style.setProperty('--float-offset', randomOffset.toString());
    elementRef.current.style.setProperty('--float-phase', randomPhase.toString());
  }, [random]);
  
  return (
    <div
      ref={elementRef}
      className={cn(
        "float-animation",
        rotate && "float-rotate",
        pause && "hover:animation-pause",
        className
      )}
      style={{
        '--float-amplitude': `${amplitude}px`,
        '--float-frequency': `${frequency}s`,
      } as React.CSSProperties}
    >
      <style>{`
        .float-animation {
          animation: float calc(var(--float-frequency) * 1s) infinite ease-in-out;
          transform-origin: center;
          animation-delay: calc(var(--float-offset, 0) * 1s);
        }
        
        .float-rotate {
          animation: float-rotate calc(var(--float-frequency) * 1.5s) infinite ease-in-out;
          animation-delay: calc(var(--float-offset, 0) * 1s);
        }
        
        .animation-pause:hover {
          animation-play-state: paused;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(calc(var(--float-amplitude) * -1 * var(--float-phase, 1)));
          }
        }
        
        @keyframes float-rotate {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(calc(var(--float-amplitude) * -0.5 * var(--float-phase, 1))) 
                      rotate(calc(1deg * var(--float-phase, 1)));
          }
          50% {
            transform: translateY(calc(var(--float-amplitude) * -1 * var(--float-phase, 1))) 
                      rotate(calc(2deg * var(--float-phase, 1)));
          }
          75% {
            transform: translateY(calc(var(--float-amplitude) * -0.5 * var(--float-phase, 1))) 
                      rotate(calc(1deg * var(--float-phase, 1)));
          }
        }
      `}</style>
      {children}
    </div>
  );
};