import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from './contexts/NotificationContext';
import { ProjectUpdateProvider } from './contexts/ProjectUpdateContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { SubdomainProvider } from './contexts/SubdomainContext';
import { AuthProvider, useAuth } from './hooks/use-auth';
import { ThemeProvider } from './hooks/use-theme';
import { AccessibilityModeProvider } from './hooks/use-accessibility-mode';
import { ErrorBoundary } from "@/components/common/status/ErrorBoundary";
import { errorHandler } from "@/lib/errorHandler";
import { WebSocketFloatingIndicator } from "@/components/common/status/WebSocketStatusIndicator";
import { WalletProvider } from "@/services/wallet/WalletProvider";
import { AppRouter } from '@/routes/AppRouter';

function AuthenticatedNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <NotificationProvider userId={user?.id}>
      {children}
    </NotificationProvider>
  );
}

function App() {
  useEffect(() => {
    errorHandler.init();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="molochain-theme">
          <AccessibilityModeProvider>
            <SubdomainProvider>
              <AuthProvider>
                <WalletProvider>
                  <WebSocketProvider 
                    endpoint="/ws/main"
                    reconnectConfig={{ maxAttempts: 10, initialDelay: 1000, maxDelay: 10000 }}
                  >
                    <AuthenticatedNotificationProvider>
                      <ProjectUpdateProvider>
                        <ErrorBoundary>
                          <AppRouter />
                        </ErrorBoundary>
                        <Toaster />
                        <WebSocketFloatingIndicator />
                      </ProjectUpdateProvider>
                    </AuthenticatedNotificationProvider>
                  </WebSocketProvider>
                </WalletProvider>
              </AuthProvider>
            </SubdomainProvider>
          </AccessibilityModeProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
