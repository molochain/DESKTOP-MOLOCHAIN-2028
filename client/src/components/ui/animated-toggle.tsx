import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface AnimatedToggleProps extends React.ComponentPropsWithoutRef<typeof Switch> {
  label?: string;
  description?: string;
  activeColor?: 'primary' | 'green' | 'blue' | 'purple' | 'amber';
}

/**
 * Enhanced toggle switch with animations and customization
 */
export function AnimatedToggle({
  checked,
  label,
  description,
  activeColor = 'primary',
  className,
  disabled,
  ...props
}: AnimatedToggleProps) {
  // Color mappings for active state
  const colorMap = {
    primary: 'bg-primary',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Switch
        checked={checked}
        disabled={disabled}
        className={cn(
          'group relative transition-colors duration-300 ease-in-out',
          disabled && 'opacity-60 cursor-not-allowed',
          checked ? colorMap[activeColor] : 'bg-gray-200'
        )}
        {...props}
      >
        <div
          className={cn(
            'absolute left-0.5 top-0.5 h-5 w-5 scale-90 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out',
            checked && 'translate-x-[18px] scale-100'
          )}
        />
        
        {/* Subtle pulse animation only when checked */}
        {checked && (
          <div className="absolute inset-0 rounded-full animate-pulse-subtle" />
        )}
      </Switch>

      {(label || description) && (
        <div className="flex flex-col">
          {label && <span className="text-sm font-medium">{label}</span>}
          {description && <span className="text-xs text-gray-500">{description}</span>}
        </div>
      )}
    </div>
  );
}