import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: "lift" | "glow" | "scale" | "border" | "shadow" | "translate";
  intensity?: "subtle" | "medium" | "strong";
  duration?: "fast" | "normal" | "slow";
  disabled?: boolean;
}

/**
 * HoverCard - Creates a card with hover effects
 * 
 * @param {ReactNode} children - Content to display in the card
 * @param {string} className - Additional CSS classes
 * @param {string} hoverEffect - Type of effect on hover
 * @param {string} intensity - Intensity of the effect
 * @param {string} duration - Duration of the animation
 * @param {boolean} disabled - Whether the effect is disabled
 */
export const HoverCard: React.FC<HoverCardProps> = ({
  children,
  className,
  hoverEffect = "lift",
  intensity = "medium",
  duration = "normal",
  disabled = false
}) => {
  // Hover effect settings
  const getHoverEffectClasses = () => {
    if (disabled) return "";
    
    const intensityValues = {
      lift: {
        subtle: "hover:-translate-y-1",
        medium: "hover:-translate-y-2",
        strong: "hover:-translate-y-3"
      },
      glow: {
        subtle: "hover:shadow-[0_0_15px_rgba(var(--primary),0.15)]",
        medium: "hover:shadow-[0_0_20px_rgba(var(--primary),0.2)]",
        strong: "hover:shadow-[0_0_30px_rgba(var(--primary),0.3)]"
      },
      scale: {
        subtle: "hover:scale-[1.01]",
        medium: "hover:scale-[1.03]",
        strong: "hover:scale-[1.05]"
      },
      border: {
        subtle: "hover:border-primary/20",
        medium: "hover:border-primary/50",
        strong: "hover:border-primary"
      },
      shadow: {
        subtle: "hover:shadow-md",
        medium: "hover:shadow-lg",
        strong: "hover:shadow-xl"
      },
      translate: {
        subtle: "hover:translate-x-1",
        medium: "hover:translate-x-2",
        strong: "hover:translate-x-3"
      }
    };
    
    return intensityValues[hoverEffect][intensity];
  };
  
  // Duration settings
  const getDurationClass = () => {
    if (disabled) return "";
    
    const durationValues = {
      fast: "transition-all duration-150",
      normal: "transition-all duration-300",
      slow: "transition-all duration-500"
    };
    
    return durationValues[duration];
  };
  
  return (
    <div 
      className={cn(
        "hover-card",
        getDurationClass(),
        getHoverEffectClasses(),
        className
      )}
    >
      {children}
    </div>
  );
};