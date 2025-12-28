import { useState, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { buttonHoverEffect } from '@/lib/animations';

type RippleType = {
  x: number;
  y: number;
  size: number;
  id: number;
};

interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  effect?: 'ripple' | 'scale' | 'glow' | 'ring' | 'none';
  type?: 'button' | 'submit' | 'reset';
  rippleColor?: string;
  rippleDuration?: number;
}

const RippleButton = ({
  children,
  className,
  variant = 'default',
  size = 'default',
  onClick,
  disabled = false,
  effect = 'ripple',
  type = 'button',
  rippleColor,
  rippleDuration = 1000,
  ...props
}: RippleButtonProps) => {
  const [ripples, setRipples] = useState<RippleType[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    // Clean up ripples that have finished animation
    const timeoutId = setTimeout(() => {
      if (ripples.length > 0) {
        setRipples([]);
      }
    }, rippleDuration + 100); // Add a small buffer to ensure animation completes

    return () => clearTimeout(timeoutId);
  }, [ripples, rippleDuration]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (effect === 'ripple' && !disabled) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const size = Math.max(rect.width, rect.height) * 2;
      
      setRipples([...ripples, { x, y, size, id: nextId }]);
      setNextId(nextId + 1);
    }
    
    onClick && onClick(e);
  };

  return (
    <Button
      className={cn(
        'relative overflow-hidden transition-all',
        buttonHoverEffect({ effect: effect === 'ripple' ? 'none' : effect }),
        className
      )}
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled}
      type={type}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={rippleColor ? "" : "absolute rounded-full bg-white/20 animate-ripple pointer-events-none"}
          style={{
            position: "absolute",
            borderRadius: "9999px",
            pointerEvents: "none",
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: rippleColor || undefined,
            animation: `ripple ${rippleDuration}ms linear forwards`,
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </Button>
  );
};

export { RippleButton };