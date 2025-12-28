import { useEffect, useState } from 'react';
import { useAssistant } from './assistant-provider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb } from 'lucide-react';

export default function FloatingHints() {
  const { currentHint, targetElement, hideHint } = useAssistant();
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (currentHint && targetElement) {
      const element = document.querySelector(`[data-hint-target="${targetElement}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        setPosition({
          x: rect.right + 10,
          y: rect.top + (rect.height / 2) - 40
        });
      }
    }
  }, [currentHint, targetElement]);

  if (!currentHint) return null;

  return (
    <div
      className="fixed z-50 animate-in fade-in-0 zoom-in-95 duration-300"
      style={{
        left: targetElement ? position.x : '50%',
        top: targetElement ? position.y : '50%',
        transform: targetElement ? 'none' : 'translate(-50%, -50%)'
      }}
    >
      <Card className="bg-gradient-to-r from-blue-500/90 to-purple-600/90 backdrop-blur-sm border-0 shadow-xl max-w-xs">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white text-sm font-medium leading-relaxed">
                {currentHint}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={hideHint}
              className="flex-shrink-0 text-gray-900 dark:text-white hover:bg-white/10 h-6 w-6 p-0"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}