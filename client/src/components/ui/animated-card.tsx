import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cardHoverEffect } from '@/lib/animations';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  effect?: 'lift' | 'glow' | 'border' | 'scale' | 'highlight' | 'tilt' | 'none';
  clickEffect?: 'push' | 'bounce' | 'none';
  onClick?: () => void;
  gradient?: boolean;
  animated?: boolean;
}

/**
 * AnimatedCard Component
 * 
 * A card component with configurable hover and click animations.
 * 
 * @param children - Content to display inside the card
 * @param className - Additional CSS classes to apply
 * @param effect - Hover animation effect (lift, glow, border, scale, highlight, tilt, or none)
 * @param clickEffect - Animation to play when clicked (push, bounce, or none)
 * @param onClick - Function to call when the card is clicked
 * @param gradient - Whether to apply a gradient background
 * @param animated - Whether to apply animations
 */
const AnimatedCard = ({
  children,
  className,
  effect = 'lift',
  clickEffect = 'none',
  onClick,
  gradient,
  animated,
  ...props
}: AnimatedCardProps) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden',
        cardHoverEffect({ effect, clickEffect }),
        onClick ? 'cursor-pointer' : '',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  );
};

export { AnimatedCard };