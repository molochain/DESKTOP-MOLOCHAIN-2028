import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AccessibilityTooltip } from '@/components/ui/accessibility-tooltip';
import { useAccessibilityMode } from '@/hooks/use-accessibility-mode';

interface AccessibleCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AccessibleCard({ title, description, children, className }: AccessibleCardProps) {
  const { isEnabled } = useAccessibilityMode();

  return (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 ${className || ''}`}>
      <CardHeader>
        <AccessibilityTooltip showOnHover={isEnabled}>
          <CardTitle className="text-gray-900 dark:text-white">{title}</CardTitle>
        </AccessibilityTooltip>
        {description && (
          <AccessibilityTooltip showOnHover={isEnabled}>
            <CardDescription className="text-gray-600 dark:text-gray-400">{description}</CardDescription>
          </AccessibilityTooltip>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}