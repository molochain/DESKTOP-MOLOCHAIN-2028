import { CheckCircle, Clock, MinusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AgentStatusIndicatorProps {
  status: 'online' | 'busy' | 'offline';
  lastActive?: Date;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const AgentStatusIndicator: React.FC<AgentStatusIndicatorProps> = ({ 
  status, 
  lastActive, 
  size = 'md', 
  showText = false,
  className
}) => {
  // Determine the icon and colors based on status
  const getIconAndColor = () => {
    switch (status) {
      case 'online':
        return {
          icon: <CheckCircle className={cn(sizeClasses.icon)} />,
          bgColor: 'bg-green-100',
          textColor: 'text-green-600',
          ringColor: 'ring-green-400',
          statusText: 'Online'
        };
      case 'busy':
        return {
          icon: <Clock className={cn(sizeClasses.icon)} />,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-600',
          ringColor: 'ring-amber-400',
          statusText: 'Busy'
        };
      case 'offline':
      default:
        return {
          icon: <MinusCircle className={cn(sizeClasses.icon)} />,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-500',
          ringColor: 'ring-gray-300',
          statusText: 'Offline'
        };
    }
  };

  // Determine classes based on size
  const sizeClasses = {
    container: {
      sm: 'w-6 h-6',
      md: 'w-8 h-8',
      lg: 'w-10 h-10'
    },
    icon: {
      sm: 'w-3.5 h-3.5',
      md: 'w-4.5 h-4.5',
      lg: 'w-6 h-6'
    },
    text: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base'
    }
  };

  const { icon, bgColor, textColor, ringColor, statusText } = getIconAndColor();

  // Format the last active time if provided
  const getLastActiveText = () => {
    if (!lastActive) return '';
    return `Last active ${formatDistanceToNow(lastActive, { addSuffix: true })}`;
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "rounded-full flex items-center justify-center ring-2",
                bgColor,
                ringColor,
                sizeClasses.container[size]
              )}
            >
              <div className={textColor}>
                {icon}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{statusText}</p>
            {lastActive && <p className="text-xs text-gray-500">{getLastActiveText()}</p>}
          </TooltipContent>
        </Tooltip>
        
        {showText && (
          <span className={cn("font-medium", textColor, sizeClasses.text[size])}>
            {statusText}
          </span>
        )}
      </div>
    </TooltipProvider>
  );
};

export default AgentStatusIndicator;