import { Link, useLocation } from 'react-router-dom';
import { Shield, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const isRegister = location.pathname === '/register';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MoloChain
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <a 
                href="https://molochain.com" 
                className="text-gray-600 hover:text-blue-600 transition-colors flex items-center gap-1"
              >
                <Home className="h-4 w-4" />
                Home
              </a>
              {isLogin ? (
                <Link 
                  to="/register" 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Register
                </Link>
              ) : isRegister ? (
                <Link 
                  to="/login" 
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Login
                </Link>
              ) : null}
            </div>

            <button 
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a 
                href="https://molochain.com" 
                className="block text-gray-600 hover:text-blue-600 py-2"
              >
                Home
              </a>
              {isLogin ? (
                <Link 
                  to="/register" 
                  className="block px-4 py-2 text-center border border-gray-300 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              ) : isRegister ? (
                <Link 
                  to="/login" 
                  className="block px-4 py-2 text-center border border-gray-300 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </nav>

      <main className="pt-20 min-h-screen flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
