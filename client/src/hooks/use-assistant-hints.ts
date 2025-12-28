import { useEffect } from 'react';
import { useAssistant } from '@/components/ai-assistant/assistant-provider';
import { useLocation } from 'wouter';

const pageHints = {
  '/dashboard': [
    'Welcome to your GOD Layer Control Center! This is where you oversee your entire MoloChain ecosystem.',
    'Pro tip: The health monitoring widgets show real-time system status.',
    'Use the quick actions panel to jump to frequently used functions.',
  ],
  '/departments': [
    'Manage all 12 departments from this central hub.',
    'Each department has its own specialized dashboard - click to explore!',
    'Use filters to quickly find specific departments or divisions.',
  ],
  '/identity': [
    'Your secure identity management center for global operations.',
    'Digital passports and certificates ensure compliance across 180+ countries.',
    'Role-based permissions keep your data secure.',
  ],
  '/visions': [
    'Strategic visions guide your long-term success.',
    'Align company, department, and division goals for maximum impact.',
    'Track progress with visual indicators and roadmaps.',
  ],
  '/capacity-management': [
    'Monitor your system\'s heartbeat in real-time.',
    'Predictive analytics help prevent issues before they occur.',
    'Resource optimization keeps your operations running smoothly.',
  ],
  '/accessibility': [
    'Ensure your dashboard meets WCAG compliance standards.',
    'Color contrast checking helps maintain accessibility.',
    'Test custom color combinations for optimal usability.',
  ],
};

export function useAssistantHints() {
  const { showHint, isEnabled } = useAssistant();
  const [location] = useLocation();

  useEffect(() => {
    if (!isEnabled) return;

    const hints = pageHints[location as keyof typeof pageHints];
    if (hints && hints.length > 0) {
      // Show a random hint after a short delay when navigating to a new page
      const timer = setTimeout(() => {
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        showHint(randomHint);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [location, showHint, isEnabled]);

  const showContextualHint = (message: string, targetElement?: string) => {
    if (isEnabled) {
      showHint(message, targetElement);
    }
  };

  return { showContextualHint };
}