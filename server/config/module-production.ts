// Production Module Configuration
export const PRODUCTION_MODULE_CONFIG = {
  // Core system modules always enabled
  core: {
    'core-pages': true,
    'authentication': true,
    'security': true,
    'performance': true
  },
  
  // Business modules
  business: {
    'projects': true,
    'tracking': true,
    'partners': true,
    'commodities': true,
    'service-pages': true
  },
  
  // Admin and management modules
  admin: {
    'admin': true,
    'file-management': true,
    'websocket': true,
    'notifications': true
  },
  
  // Developer tools (can be disabled in production)
  developer: {
    'developer-portal': process.env.NODE_ENV !== 'production',
    'analytics': true,
    'health': true
  }
};

export function getEnabledModules(): string[] {
  const enabled: string[] = [];
  
  Object.values(PRODUCTION_MODULE_CONFIG).forEach(category => {
    Object.entries(category).forEach(([module, isEnabled]) => {
      if (isEnabled) {
        enabled.push(module);
      }
    });
  });
  
  return enabled;
}

export function isModuleEnabled(moduleName: string): boolean {
  return getEnabledModules().includes(moduleName);
}