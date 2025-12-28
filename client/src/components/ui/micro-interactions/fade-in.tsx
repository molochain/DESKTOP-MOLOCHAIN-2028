import React, { ReactNode, useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  duration?: "fast" | "normal" | "slow";
  delay?: number;
  visible?: boolean;
  threshold?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  staggered?: boolean;
  staggerDelay?: number;
  onFadeComplete?: () => void;
}

/**
 * FadeIn - Creates a fade-in animation when element appears in view
 * 
 * @param {ReactNode} children - Content to fade in
 * @param {string} className - Additional CSS classes
 * @param {string} duration - Speed of the animation
 * @param {number} delay - Delay before starting in ms
 * @param {boolean} visible - Force visibility regardless of position
 * @param {number} threshold - Percentage of element that needs to be visible
 * @param {string} direction - Direction to fade from
 * @param {number} distance - Distance to fade from in pixels
 * @param {boolean} staggered - Whether children should fade in with a stagger effect
 * @param {number} staggerDelay - Delay between staggered children 
 * @param {function} onFadeComplete - Callback when fade completes
 */
export const FadeIn: React.FC<FadeInProps> = ({
  children,
  className,
  duration = "normal",
  delay = 0,
  visible = false,
  threshold = 0.2,
  direction = "none",
  distance = 20,
  staggered = false,
  staggerDelay = 100,
  onFadeComplete
}) => {
  const [isVisible, setIsVisible] = useState(visible);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const durationClasses = {
    fast: "duration-300",
    normal: "duration-500",
    slow: "duration-1000"
  };
  
  const getTransformStyles = () => {
    if (direction === "none") return {};
    
    const transforms: Record<string, string> = {
      initial: "",
      final: ""
    };
    
    switch (direction) {
      case "up":
        transforms.initial = `translateY(${distance}px)`;
        transforms.final = "translateY(0)";
        break;
      case "down":
        transforms.initial = `translateY(-${distance}px)`;
        transforms.final = "translateY(0)";
        break;
      case "left":
        transforms.initial = `translateX(${distance}px)`;
        transforms.final = "translateX(0)";
        break;
      case "right":
        transforms.initial = `translateX(-${distance}px)`;
        transforms.final = "translateX(0)";
        break;
      default:
        transforms.initial = "";
        transforms.final = "";
    }
    
    return transforms;
  };
  
  useEffect(() => {
    // If visibility is forced, don't use Intersection Observer
    if (visible) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (containerRef.current) {
            observer.unobserve(containerRef.current);
          }
          
          // Call fade complete callback after animation finishes
          if (onFadeComplete) {
            const timeout = setTimeout(() => {
              onFadeComplete();
            }, 
            duration === "fast" ? 300 : 
            duration === "normal" ? 500 : 1000);
            
            return () => clearTimeout(timeout);
          }
        }
      },
      {
        threshold,
        rootMargin: '0px'
      }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [visible, threshold, onFadeComplete, duration]);
  
  const transforms = getTransformStyles();
  const transitionTimingInMilliseconds = 
    duration === "fast" ? 300 : 
    duration === "normal" ? 500 : 1000;
  
  // Staggered children
  const renderChildren = () => {
    if (!staggered || !React.Children.count(children)) {
      return children;
    }
    
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;
      
      return (
        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? transforms.final : transforms.initial,
            transition: `opacity ${transitionTimingInMilliseconds}ms ease-out, transform ${transitionTimingInMilliseconds}ms ease-out`,
            transitionDelay: `${delay + (index * staggerDelay)}ms`
          }}
        >
          {child}
        </div>
      );
    });
  };
  
  return (
    <div 
      ref={containerRef}
      className={cn("fade-in-container", className)}
      style={staggered ? {} : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? transforms.final : transforms.initial,
        transition: `opacity ${transitionTimingInMilliseconds}ms ease-out, transform ${transitionTimingInMilliseconds}ms ease-out`,
        transitionDelay: `${delay}ms`
      }}
    >
      {staggered ? renderChildren() : children}
    </div>
  );
};