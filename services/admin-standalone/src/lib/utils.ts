import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatUptime(uptime: string): string {
  return uptime.replace(/^Up\s+/, '');
}

export function getHealthColor(health: string): string {
  switch (health) {
    case 'healthy':
      return 'text-green-500';
    case 'unhealthy':
      return 'text-red-500';
    default:
      return 'text-yellow-500';
  }
}

export function getHealthBgColor(health: string): string {
  switch (health) {
    case 'healthy':
      return 'bg-green-500/10 border-green-500/30';
    case 'unhealthy':
      return 'bg-red-500/10 border-red-500/30';
    default:
      return 'bg-yellow-500/10 border-yellow-500/30';
  }
}
