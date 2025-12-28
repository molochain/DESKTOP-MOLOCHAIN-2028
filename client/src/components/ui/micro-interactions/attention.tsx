import React, { ReactNode, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AttentionProps {
  children: ReactNode;
  className?: string;
  effect?: "shake" | "bounce" | "flash" | "pulse" | "wiggle" | "tada" | "jello";
  duration?: number;  // Duration in ms
  delay?: number;     // Delay in ms
  repeat?: number;    // Number of times to repeat (0 = infinite)
  intensity?: "subtle" | "medium" | "strong";
  trigger?: "initial" | "hover" | "interval" | "manual";
  interval?: number;  // Interval in ms for interval trigger
  active?: boolean;   // For manual trigger
}

/**
 * Attention - Applies attention-grabbing animations to elements
 * 
 * @param {ReactNode} children - Content to animate
 * @param {string} className - Additional CSS classes
 * @param {string} effect - Type of attention effect
 * @param {number} duration - Duration of animation in ms
 * @param {number} delay - Delay before animation starts in ms
 * @param {number} repeat - Number of times to repeat (0 = infinite)
 * @param {string} intensity - Intensity of the effect
 * @param {string} trigger - When to trigger the animation
 * @param {number} interval - Interval for repeating in ms
 * @param {boolean} active - For manual trigger control
 */
export const Attention: React.FC<AttentionProps> = ({
  children,
  className,
  effect = "shake",
  duration = 1000,
  delay = 0,
  repeat = 1,
  intensity = "medium",
  trigger = "initial",
  interval = 5000,
  active = false
}) => {
  const [isAnimating, setIsAnimating] = useState(trigger === "initial");
  const [key, setKey] = useState(0); // For resetting animations
  
  // Intensity modifiers
  const intensityMap = {
    shake: {
      subtle: "translate-x-px",
      medium: "translate-x-1",
      strong: "translate-x-2"
    },
    bounce: {
      subtle: "translate-y-1",
      medium: "translate-y-2",
      strong: "translate-y-3"
    },
    flash: {
      subtle: "opacity-80",
      medium: "opacity-50",
      strong: "opacity-30"
    },
    pulse: {
      subtle: "scale-105",
      medium: "scale-110",
      strong: "scale-125"
    },
    wiggle: {
      subtle: "rotate-1",
      medium: "rotate-3",
      strong: "rotate-6"
    },
    tada: {
      subtle: "scale-105 rotate-1",
      medium: "scale-110 rotate-3",
      strong: "scale-125 rotate-6"
    },
    jello: {
      subtle: "skew-x-2 skew-y-1",
      medium: "skew-x-5 skew-y-3",
      strong: "skew-x-10 skew-y-5"
    }
  };
  
  const intensityValue = intensityMap[effect][intensity];
  
  // Handle interval trigger
  useEffect(() => {
    if (trigger !== "interval") return;
    
    const intervalId = setInterval(() => {
      setIsAnimating(true);
      setKey(prev => prev + 1);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }, interval);
    
    return () => clearInterval(intervalId);
  }, [trigger, interval, duration]);
  
  // Handle manual trigger
  useEffect(() => {
    if (trigger !== "manual") return;
    
    if (active) {
      setIsAnimating(true);
      setKey(prev => prev + 1);
      
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [trigger, active, duration]);
  
  // Handle hover trigger
  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsAnimating(true);
      setKey(prev => prev + 1);
    }
  };
  
  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setIsAnimating(false);
    }
  };
  
  return (
    <div
      className={cn(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-${intensityValue}); }
          20%, 40%, 60%, 80% { transform: translateX(${intensityValue}); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-${intensityValue}); }
          60% { transform: translateY(-${intensityValue}); }
        }
        
        @keyframes flash {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: ${intensityValue}; }
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: ${intensityValue}; }
          100% { transform: scale(1); }
        }
        
        @keyframes wiggle {
          0%, 100% { transform: rotate(0); }
          25% { transform: rotate(-${intensityValue}); }
          50% { transform: rotate(0); }
          75% { transform: rotate(${intensityValue}); }
        }
        
        @keyframes tada {
          0% { transform: scale(1) rotate(0); }
          10%, 20% { transform: scale(0.9) rotate(-3deg); }
          30%, 50%, 70%, 90% { transform: ${intensityValue}; }
          40%, 60%, 80% { transform: ${intensityValue.replace('rotate-', 'rotate-neg-')}; }
          100% { transform: scale(1) rotate(0); }
        }
        
        @keyframes jello {
          0%, 100% { transform: skew(0, 0); }
          30% { transform: ${intensityValue}; }
          50% { transform: ${intensityValue.replace('skew-', 'skew-neg-')}; }
          65% { transform: ${intensityValue.replace(/\d+/g, match => String(Number(match) / 2))}; }
          85% { transform: ${intensityValue.replace('skew-', 'skew-neg-').replace(/\d+/g, match => String(Number(match) / 4))}; }
        }
        
        .animate-attention {
          animation-name: ${effect};
          animation-duration: ${duration}ms;
          animation-delay: ${delay}ms;
          animation-iteration-count: ${repeat === 0 ? 'infinite' : repeat};
          animation-fill-mode: both;
        }
      `}</style>
      
      <div key={key} className={isAnimating ? "animate-attention" : ""}>
        {children}
      </div>
    </div>
  );
};