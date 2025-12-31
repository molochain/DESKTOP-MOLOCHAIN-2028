import { Sun, Moon, Bell, User } from 'lucide-react';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  username?: string;
}

export function Header({ theme, onToggleTheme, username }: HeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
          Molochain Control Center
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
          data-testid="btn-toggle-theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors relative"
          data-testid="btn-notifications"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 ml-2 pl-4 border-l border-slate-200 dark:border-slate-700">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {username || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
}
