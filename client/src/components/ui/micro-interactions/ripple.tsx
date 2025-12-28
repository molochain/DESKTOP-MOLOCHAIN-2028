import React, { ReactNode, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface RippleProps {
  children: ReactNode;
  className?: string;
  color?: string;
  duration?: number;
  opacity?: number;
  size?: "small" | "medium" | "large" | "fill";
  disabled?: boolean;
  center?: boolean;
}

/**
 * Ripple - Creates a material design ripple effect on click
 * 
 * @param {ReactNode} children - Content to display with ripple effect
 * @param {string} className - Additional CSS classes
 * @param {string} color - Ripple color (CSS color value)
 * @param {number} duration - Duration of the ripple animation in ms
 * @param {number} opacity - Opacity of the ripple effect
 * @param {string} size - Size of the ripple
 * @param {boolean} disabled - Whether the ripple effect is disabled
 * @param {boolean} center - Whether to always start ripple from center
 */
export const Ripple: React.FC<RippleProps> = ({
  children,
  className,
  color = "rgba(255, 255, 255, 0.7)",
  duration = 850,
  opacity = 0.35,
  size = "medium",
  disabled = false,
  center = false
}) => {
  const [ripples, setRipples] = useState<Array<{
    x: number,
    y: number,
    size: number,
    id: number
  }>>([]);
  
  const nextId = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate ripple size based on container dimensions and selected size option
  const calcRippleSize = (x: number, y: number, containerWidth: number, containerHeight: number) => {
    if (size === "fill") {
      // Maximum of container width/height and distance to farthest corner
      const topLeft = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
      const topRight = Math.sqrt(Math.pow(containerWidth - x, 2) + Math.pow(y, 2));
      const bottomLeft = Math.sqrt(Math.pow(x, 2) + Math.pow(containerHeight - y, 2));
      const bottomRight = Math.sqrt(Math.pow(containerWidth - x, 2) + Math.pow(containerHeight - y, 2));
      
      return Math.max(topLeft, topRight, bottomLeft, bottomRight) * 2;
    }
    
    const multiplier = size === "small" ? 1 : size === "medium" ? 2 : 3;
    return Math.min(containerWidth, containerHeight) * multiplier;
  };
  
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !containerRef.current) return;
    
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate click position relative to container
    let x = center ? rect.width / 2 : event.clientX - rect.left;
    let y = center ? rect.height / 2 : event.clientY - rect.top;
    
    // Calculate ripple size
    const rippleSize = calcRippleSize(x, y, rect.width, rect.height);
    
    // Add new ripple
    const newRipple = {
      x,
      y,
      size: rippleSize,
      id: nextId.current
    };
    
    nextId.current += 1;
    setRipples(prev => [...prev, newRipple]);
    
    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, duration);
  };
  
  // Clean up any remaining ripples when component unmounts
  useEffect(() => {
    return () => {
      setRipples([]);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={cn("ripple-container relative overflow-hidden", className)}
      onClick={handleClick}
      style={{ position: "relative" }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: "absolute",
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            borderRadius: "50%",
            backgroundColor: color,
            opacity: opacity,
            transform: "scale(0)",
            animation: `ripple-animation ${duration}ms ease-out`,
            pointerEvents: "none",
            zIndex: 1
          }}
        />
      ))}
      
      <style>
        {`
          @keyframes ripple-animation {
            0% {
              transform: scale(0);
              opacity: ${opacity};
            }
            75% {
              opacity: ${opacity * 0.6};
            }
            100% {
              transform: scale(1);
              opacity: 0;
            }
          }
          
          .ripple-container {
            -webkit-tap-highlight-color: transparent;
          }
        `}
      </style>
      
      <div className="relative z-2">
        {children}
      </div>
    </div>
  );
};