import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Lock, Shield } from "lucide-react";

interface AdminPublicLayoutProps {
  children: ReactNode;
}

export default function AdminPublicLayout({ children }: AdminPublicLayoutProps) {
  const handleLogin = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  Molochain
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                  Admin Portal
                </span>
              </div>
            </div>

            {/* Login Button */}
            <Button 
              onClick={handleLogin}
              data-testid="header-button-login"
            >
              <Lock className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="w-4 h-4" />
              <span>Molochain Admin Portal</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Molochain. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
