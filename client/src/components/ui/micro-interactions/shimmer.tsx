import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ShimmerProps {
  children?: ReactNode;
  className?: string;
  width?: string;
  height?: string;
  color?: string;
  gradientColor?: string;
  duration?: "fast" | "normal" | "slow";
  direction?: "left-to-right" | "right-to-left" | "top-to-bottom" | "bottom-to-top";
  repeat?: "infinite" | "once";
}

/**
 * Shimmer - Creates a shimmering gradient animation effect
 * 
 * @param {ReactNode} children - Optional content to display with the shimmer effect
 * @param {string} className - Additional CSS classes
 * @param {string} width - Width of the shimmer element
 * @param {string} height - Height of the shimmer element
 * @param {string} color - Base color (background)
 * @param {string} gradientColor - Shimmer color (moving gradient)
 * @param {string} duration - Speed of the animation
 * @param {string} direction - Direction of the shimmer movement
 * @param {string} repeat - Whether to repeat the animation
 */
export const Shimmer: React.FC<ShimmerProps> = ({
  children,
  className,
  width = "100%",
  height = "100%",
  color = "rgba(255, 255, 255, 0.1)",
  gradientColor = "rgba(255, 255, 255, 0.3)",
  duration = "normal",
  direction = "left-to-right",
  repeat = "infinite"
}) => {
  // Animation duration values
  const durationValues = {
    fast: "1s",
    normal: "2s",
    slow: "3s"
  };
  
  // Animation direction settings
  const gradientDirections = {
    "left-to-right": "to right",
    "right-to-left": "to left",
    "top-to-bottom": "to bottom",
    "bottom-to-top": "to top"
  };
  
  // Define gradient start and end positions based on direction
  const getGradientPositions = () => {
    switch (direction) {
      case "left-to-right":
        return {
          start: "-100%",
          end: "200%"
        };
      case "right-to-left":
        return {
          start: "200%",
          end: "-100%"
        };
      case "top-to-bottom":
        return {
          start: "-100%",
          end: "200%"
        };
      case "bottom-to-top":
        return {
          start: "200%",
          end: "-100%"
        };
      default:
        return {
          start: "-100%",
          end: "200%"
        };
    }
  };
  
  const { start, end } = getGradientPositions();
  const isHorizontal = direction === "left-to-right" || direction === "right-to-left";
  
  return (
    <div 
      className={cn("shimmer-container relative overflow-hidden", className)}
      style={{ width, height }}
    >
      <style>{`
        .shimmer-container::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${color};
          z-index: 1;
        }
        
        .shimmer-container::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            ${gradientDirections[direction]},
            transparent 0%,
            ${gradientColor} 50%,
            transparent 100%
          );
          z-index: 2;
          animation: shimmer ${durationValues[duration]} ${repeat} ease-in-out;
          ${isHorizontal 
            ? `transform: translateX(${start});` 
            : `transform: translateY(${start});`}
        }
        
        @keyframes shimmer {
          0% {
            ${isHorizontal 
              ? `transform: translateX(${start});` 
              : `transform: translateY(${start});`}
          }
          100% {
            ${isHorizontal 
              ? `transform: translateX(${end});` 
              : `transform: translateY(${end});`}
          }
        }
        
        .shimmer-content {
          position: relative;
          z-index: 3;
        }
      `}</style>
      
      {children && (
        <div className="shimmer-content">
          {children}
        </div>
      )}
    </div>
  );
};