import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AccessibilityModeContextType {
  isEnabled: boolean;
  toggle: () => void;
}

const AccessibilityModeContext = createContext<AccessibilityModeContextType | undefined>(undefined);

export function AccessibilityModeProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibility-mode');
      return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibility-mode', isEnabled.toString());
    }
  }, [isEnabled]);

  const toggle = () => setIsEnabled(!isEnabled);

  return (
    <AccessibilityModeContext.Provider value={{ isEnabled, toggle }}>
      {children}
    </AccessibilityModeContext.Provider>
  );
}

export function useAccessibilityMode() {
  const context = useContext(AccessibilityModeContext);
  if (!context) {
    throw new Error('useAccessibilityMode must be used within AccessibilityModeProvider');
  }
  return context;
}