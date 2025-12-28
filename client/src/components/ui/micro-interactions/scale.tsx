import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ScaleProps {
  children: ReactNode;
  className?: string;
  scaleFactor?: number;
  duration?: "fast" | "normal" | "slow";
  curve?: "ease" | "linear" | "ease-in" | "ease-out" | "ease-in-out";
  trigger?: "hover" | "active" | "focus";
  direction?: "up" | "down" | "both";
  origin?: string; // CSS transform-origin value
}

/**
 * Scale - Creates a smooth scaling effect on interaction
 * 
 * @param {ReactNode} children - Content to apply scaling to
 * @param {string} className - Additional CSS classes
 * @param {number} scaleFactor - Amount to scale by
 * @param {string} duration - Speed of the scaling animation
 * @param {string} curve - Easing curve for the animation
 * @param {string} trigger - What interaction triggers the scaling
 * @param {string} direction - Direction of scaling
 * @param {string} origin - Transform origin point
 */
export const Scale: React.FC<ScaleProps> = ({
  children,
  className,
  scaleFactor = 0.05,
  duration = "normal",
  curve = "ease-out",
  trigger = "hover",
  direction = "both",
  origin = "center"
}) => {
  // Duration settings
  const durationMap = {
    fast: "duration-150",
    normal: "duration-300",
    slow: "duration-500"
  };
  
  // Curve settings
  const curveMap = {
    "ease": "ease",
    "linear": "linear",
    "ease-in": "ease-in",
    "ease-out": "ease-out",
    "ease-in-out": "ease-in-out"
  };
  
  // Calculate scale values based on direction
  const getScaleClasses = () => {
    const scaleUp = 1 + scaleFactor;
    const scaleDown = 1 - scaleFactor;
    
    switch (direction) {
      case "up":
        return `hover:scale-${Math.round(scaleUp * 100)}`;
      case "down":
        return `hover:scale-${Math.round(scaleDown * 100)}`;
      case "both":
      default:
        return trigger === "active"
          ? `active:scale-${Math.round(scaleDown * 100)}`
          : `hover:scale-${Math.round(scaleUp * 100)}`;
    }
  };
  
  // Get trigger classes
  const getTriggerClass = () => {
    if (trigger === "focus") return "focus:scale-105";
    if (trigger === "active") return "active:scale-95";
    return ""; // hover is handled in getScaleClasses
  };
  
  return (
    <div
      className={cn(
        "transform transition",
        durationMap[duration],
        getScaleClasses(),
        getTriggerClass(),
        className
      )}
      style={{
        transformOrigin: origin,
        transitionTimingFunction: curveMap[curve]
      }}
    >
      {children}
    </div>
  );
};