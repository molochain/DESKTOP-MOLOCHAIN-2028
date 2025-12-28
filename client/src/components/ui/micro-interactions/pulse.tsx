import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PulseProps {
  children: ReactNode;
  className?: string;
  color?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error" | "custom";
  customColor?: string;
  size?: "small" | "medium" | "large";
  intensity?: "subtle" | "medium" | "strong";
  speed?: "slow" | "medium" | "fast";
  infinite?: boolean;
  withShadow?: boolean;
}

/**
 * Pulse - Creates a pulsing animation effect around an element
 * 
 * @param {ReactNode} children - Content to display
 * @param {string} className - Additional CSS classes
 * @param {string} color - Color theme for the pulse effect
 * @param {string} customColor - Custom color in CSS format (used when color="custom")
 * @param {string} size - Size of the pulse effect
 * @param {string} intensity - Intensity of the effect
 * @param {string} speed - Speed of the animation
 * @param {boolean} infinite - Whether pulse should loop infinitely
 * @param {boolean} withShadow - Whether to add shadow effect
 */
export const Pulse: React.FC<PulseProps> = ({
  children,
  className,
  color = "primary",
  customColor,
  size = "medium",
  intensity = "medium",
  speed = "medium",
  infinite = true,
  withShadow = false
}) => {
  // Color classes mapping
  const colorClass = `pulse-${color}`;
  
  // Size classes mapping
  const sizeClass = `pulse-${size}`;
  
  // Intensity classes mapping
  const intensityClass = intensity === "subtle" 
    ? "pulse-subtle" 
    : intensity === "strong" 
      ? "pulse-strong" 
      : "pulse-medium-intensity";
  
  // Shadow class
  const shadowClass = withShadow ? "pulse-shadow" : "";
  
  // Animation duration based on speed
  const animationDuration = speed === "fast" 
    ? "animation-duration-1000" 
    : speed === "slow" 
      ? "animation-duration-3000" 
      : "animation-duration-2000";
  
  // Animation class based on whether it's infinite or once
  const animationClass = infinite ? "animate-pulse-infinite" : "animate-pulse-once";
  
  return (
    <div className={cn("pulse-container", className)}>
      <style>{`
        .pulse-container {
          position: relative;
          display: inline-flex;
        }
        
        .pulse-effect {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: -1;
          transform: scale(0.1);
          opacity: 0.8;
        }
        
        .pulse-primary { background-color: rgba(var(--primary), 0.3); }
        .pulse-secondary { background-color: rgba(var(--secondary), 0.3); }
        .pulse-accent { background-color: rgba(var(--accent), 0.3); }
        .pulse-info { background-color: rgba(59, 130, 246, 0.3); }
        .pulse-success { background-color: rgba(16, 185, 129, 0.3); }
        .pulse-warning { background-color: rgba(245, 158, 11, 0.3); }
        .pulse-error { background-color: rgba(239, 68, 68, 0.3); }
        .pulse-custom { background-color: ${customColor || 'transparent'}; }
        
        .pulse-small {
          width: 150%;
          height: 150%;
          left: -25%;
          top: -25%;
        }
        
        .pulse-medium {
          width: 200%;
          height: 200%;
          left: -50%;
          top: -50%;
        }
        
        .pulse-large {
          width: 250%;
          height: 250%;
          left: -75%;
          top: -75%;
        }
        
        .pulse-subtle { opacity: 0.15; }
        .pulse-medium-intensity { opacity: 0.3; }
        .pulse-strong { opacity: 0.5; }
        
        .pulse-shadow {
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        }
        
        .animate-pulse-infinite {
          animation: pulse-animation 2s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        .animate-pulse-once {
          animation: pulse-animation 2s 1 cubic-bezier(0.4, 0, 0.6, 1);
        }
        
        .animation-duration-1000 { animation-duration: 1000ms; }
        .animation-duration-2000 { animation-duration: 2000ms; }
        .animation-duration-3000 { animation-duration: 3000ms; }
        
        @keyframes pulse-animation {
          0% {
            transform: scale(0.1);
            opacity: 0.8;
          }
          70% {
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
      
      <div
        className={cn(
          "pulse-effect",
          colorClass,
          sizeClass,
          intensityClass,
          shadowClass,
          animationClass,
          animationDuration
        )}
      />
      
      {children}
    </div>
  );
};