import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Home,
  MessageSquare,
  LineChart,
  Sparkles,
  Brain,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const aiPages = [
  {
    id: 'hub',
    title: 'AI Hub',
    path: '/ai',
    icon: Home,
    description: 'Central AI command center'
  },
  {
    id: 'enhanced',
    title: 'Enhanced',
    path: '/ai/rayanava-enhanced',
    icon: Sparkles,
    description: 'Voice & visual AI assistant'
  },
  {
    id: 'chat',
    title: 'Chat',
    path: '/ai/rayanava',
    icon: MessageSquare,
    description: 'Conversational AI'
  },
  {
    id: 'analytics',
    title: 'Analytics',
    path: '/ai/analytics',
    icon: LineChart,
    description: 'AI performance metrics'
  }
];

interface AINavigationProps {
  currentPage?: string;
  showDescription?: boolean;
}

export function AINavigation({ currentPage, showDescription = false }: AINavigationProps) {
  const [location] = useLocation();
  const currentPath = currentPage || location;
  
  const currentIndex = aiPages.findIndex(page => page.path === currentPath);
  const prevPage = currentIndex > 0 ? aiPages[currentIndex - 1] : null;
  const nextPage = currentIndex < aiPages.length - 1 ? aiPages[currentIndex + 1] : null;

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border-purple-200 dark:border-purple-700">
      <div className="flex flex-col space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/ai">
              <Button variant="ghost" size="sm" className="p-1">
                <Home className="h-4 w-4" />
              </Button>
            </Link>
            <span className="text-gray-500">/</span>
            <span className="font-medium text-purple-700 dark:text-purple-300">
              {aiPages.find(p => p.path === currentPath)?.title || 'AI'}
            </span>
          </div>
          
          {/* Previous/Next Navigation */}
          <div className="flex items-center space-x-2">
            {prevPage && (
              <Link href={prevPage.path}>
                <Button variant="outline" size="sm" className="flex items-center">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {prevPage.title}
                </Button>
              </Link>
            )}
            {nextPage && (
              <Link href={nextPage.path}>
                <Button variant="outline" size="sm" className="flex items-center">
                  {nextPage.title}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2">
          {aiPages.map((page) => {
            const Icon = page.icon;
            const isActive = currentPath === page.path;
            
            return (
              <Link key={page.id} href={page.path}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`flex items-center space-x-2 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                      : 'hover:bg-purple-100 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{page.title}</span>
                  {showDescription && (
                    <span className="hidden md:inline text-xs opacity-70">
                      - {page.description}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Optional Descriptions */}
        {showDescription && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-purple-200 dark:border-purple-700">
            {aiPages.map((page) => {
              const Icon = page.icon;
              const isActive = currentPath === page.path;
              
              return (
                <Link key={page.id} href={page.path}>
                  <div 
                    className={`p-2 rounded-lg cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-600' 
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/10'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      <Icon className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium">{page.title}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {page.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

export function AIQuickNav() {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="p-2 shadow-lg border-purple-200 dark:border-purple-700">
        <div className="flex items-center space-x-2">
          <Link href="/ai">
            <Button 
              variant={location === '/ai' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              title="AI Hub"
            >
              <Home className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/ai/rayanava-enhanced">
            <Button 
              variant={location === '/ai/rayanava-enhanced' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              title="Enhanced AI"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/ai/rayanava">
            <Button 
              variant={location === '/ai/rayanava' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              title="AI Chat"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/ai/analytics">
            <Button 
              variant={location === '/ai/analytics' ? 'default' : 'ghost'} 
              size="icon"
              className="h-8 w-8"
              title="AI Analytics"
            >
              <LineChart className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}