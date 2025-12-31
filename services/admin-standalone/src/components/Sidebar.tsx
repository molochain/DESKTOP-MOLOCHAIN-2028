import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Server,
  Brain,
  Database,
  Link2,
  MessageSquare,
  Workflow,
  FileCode,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LineChart,
  Boxes,
  Users,
  Bell,
  Terminal,
  ShieldCheck,
  HardDrive,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/containers', icon: Boxes, label: 'Containers' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/core', icon: Server, label: 'Core Services' },
  { path: '/rayanava', icon: Brain, label: 'Rayanava AI' },
  { path: '/infrastructure', icon: Database, label: 'Infrastructure' },
  { path: '/metrics', icon: LineChart, label: 'Metrics' },
  { path: '/logs', icon: Terminal, label: 'Logs' },
  { path: '/security', icon: ShieldCheck, label: 'Security' },
  { path: '/database', icon: HardDrive, label: 'Database' },
  { path: '/mololink', icon: Link2, label: 'Mololink' },
  { path: '/communications', icon: MessageSquare, label: 'Communications' },
  { path: '/workflows', icon: Workflow, label: 'Workflows' },
  { path: '/cms', icon: FileCode, label: 'CMS' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ collapsed, onToggle, onLogout }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-slate-900 dark:bg-slate-950 border-r border-slate-800 transition-all duration-300 z-50 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-white font-semibold">Admin</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          data-testid="btn-toggle-sidebar"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon size={20} />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
            collapsed && 'justify-center px-0'
          )}
          data-testid="btn-logout"
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
