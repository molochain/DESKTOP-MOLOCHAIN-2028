import { createContext, useContext, useState, ReactNode } from 'react';

interface AssistantContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  showHint: (message: string, element?: string) => void;
  hideHint: () => void;
  currentHint: string | null;
  targetElement: string | null;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

interface AssistantProviderProps {
  children: ReactNode;
}

export function AssistantProvider({ children }: AssistantProviderProps) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [targetElement, setTargetElement] = useState<string | null>(null);

  const showHint = (message: string, element?: string) => {
    setCurrentHint(message);
    setTargetElement(element || null);
    
    // Auto-hide hint after 5 seconds
    setTimeout(() => {
      setCurrentHint(null);
      setTargetElement(null);
    }, 5000);
  };

  const hideHint = () => {
    setCurrentHint(null);
    setTargetElement(null);
  };

  return (
    <AssistantContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        showHint,
        hideHint,
        currentHint,
        targetElement,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
}

export function useAssistant() {
  const context = useContext(AssistantContext);
  if (context === undefined) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
}