// Frontend Module Integration
import { moduleManager } from '../../../modules/module-manager';

export class FrontendModuleIntegration {
  private static instance: FrontendModuleIntegration;
  
  static getInstance(): FrontendModuleIntegration {
    if (!this.instance) {
      this.instance = new FrontendModuleIntegration();
    }
    return this.instance;
  }

  async loadModule(moduleName: string): Promise<any> {
    try {
      switch (moduleName) {
        case 'services':
          return await import('../pages/Services');
        case 'projects':
          return await import('../pages/Projects');
        case 'tracking':
          return await import('../pages/TrackingDashboard');
        case 'admin':
          return await import('../pages/admin/Dashboard');
        case 'developer':
          return await import('../pages/DeveloperPortal');
        default:
          return null;
      }
    } catch (error) {
      // Module loading error handled
      return null;
    }
  }

  getAvailableModules(): string[] {
    return [
      'core-pages',
      'projects', 
      'tracking',
      'admin',
      'services',
      'developer-portal',
      'file-management',
      'authentication',
      'partners',
      'commodities'
    ];
  }

  isModuleEnabled(moduleName: string): boolean {
    return this.getAvailableModules().includes(moduleName);
  }
}

export const frontendModuleIntegration = FrontendModuleIntegration.getInstance();