import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Breadcrumb } from './Breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import { Boxes } from 'lucide-react';
import { WorkspaceCollaborationWidget } from '@/components/ui/collaboration-indicators';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Boxes className="text-gray-900 dark:text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">MoloChain</h1>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = '/api/login';
    return null;
  }

  return (
    <div className="flex h-screen bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header isOnline={true} />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 relative">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            {children}
          </div>
          <WorkspaceCollaborationWidget currentPage={window.location.pathname} />
        </main>
      </div>
    </div>
  );
}