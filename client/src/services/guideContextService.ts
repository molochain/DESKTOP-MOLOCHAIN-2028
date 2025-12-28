import { Guide } from '../types/guides';

// Mapping of module/page paths to relevant guide codes (using actual codes from database)
export const guideContextMap: Record<string, string[]> = {
  // Main Dashboard Pages
  '/': ['ORG-VISIONS', 'ORG-MISSIONS', 'OPR-WORKFLOWS'],
  '/dashboard': ['OPR-REPORTS', 'OPR-ANALYSES', 'OPR-TRACKING'],
  '/projects': ['BUS-PROJECTS', 'OPR-WORKFLOWS', 'OPR-TASKS'],
  '/services': ['BUS-SERVICES', 'OPR-LOGISTICS', 'BUS-STRATEGIES'],
  '/tracking': ['OPR-TRACKING', 'OPR-LOGISTICS', 'GEO-GLOBAL'],
  '/commodities': ['BUS-TRADE', 'BUS-FINANCE', 'OPR-DOCUMENTS'],
  
  // Department Dashboards  
  '/departments/accounting': ['BUS-FINANCE', 'BUS-PAYMENT', 'OPR-REPORTS'],
  '/departments/hr': ['ORG-ROLES', 'ORG-ID-PASSPORT', 'ORG-POLICIES'],
  '/departments/operations': ['OPR-LOGISTICS', 'OPR-WORKFLOWS', 'OPR-TRACKING'],
  '/departments/supply-chain': ['OPR-SUPPLY-CHAIN', 'OPR-TRACKING', 'BUS-TRADE'],
  '/departments/technology': ['OPR-BUILDS', 'OPR-INFORMATION', 'OPR-PROTOCOL'],
  '/departments/marketing': ['BUS-MARKETING', 'BUS-SALES', 'BUS-PROMOTIONS'],
  '/departments/management': ['ORG-GOVERNANCE', 'ORG-MISSIONS', 'ORG-VISIONS'],
  '/departments/legal': ['ORG-POLICIES', 'OPR-CERTIFICATES', 'OPR-DOCUMENTS'],
  
  // Module Pages
  '/modules/transport': ['OPR-TRANSPORT', 'OPR-TRACKING', 'GEO-REGIONAL'],
  '/modules/transport/air': ['OPR-TRANSPORT', 'OPR-LOGISTICS', 'GEO-GLOBAL'],
  '/modules/transport/maritime': ['OPR-TRANSPORT', 'OPR-TRACKING', 'GEO-AMERICAS'],
  '/modules/transport/land': ['OPR-TRANSPORT', 'OPR-TRACKING', 'GEO-REGIONAL'],
  '/modules/mololink': ['BUS-MARKETPLACES', 'BUS-SERVICES', 'OPR-DOCUMENTS'],
  '/modules/marketplace': ['BUS-TRADE', 'BUS-SALES', 'BUS-MARKETPLACES'],
  '/modules/rayanavabrain': ['OPR-BUILDS', 'OPR-INFORMATION', 'OPR-ANALYSES'],
  
  // Admin & System Pages
  '/admin': ['ORG-GOVERNANCE', 'ORG-ROLES', 'OPR-PERMISSIONS'],
  '/ecosystem': ['ORG-ORGANIZATIONS', 'BUS-PARTNERSHIPS', 'ORG-RELATIONS'],
  '/developer': ['OPR-BUILDS', 'OPR-PROTOCOL', 'OPR-INFORMATION'],
  '/api-keys': ['OPR-PERMISSIONS', 'OPR-PROTOCOL', 'OPR-VERIFICATIONS'],
  '/reports': ['OPR-REPORTS', 'OPR-ANALYSES', 'BUS-FINANCE'],
  '/authentication-guide': ['ORG-ID-PASSPORT', 'ORG-ROLES', 'OPR-PERMISSIONS'],
  
  // Other Pages
  '/about': ['ORG-HISTORIES', 'ORG-MISSIONS', 'ORG-VISIONS'],
  '/contact': ['OPR-SUPPORTS', 'BUS-SERVICES', 'OPR-INFORMATION'],
  '/partners': ['BUS-PARTNERSHIPS', 'BUS-ALLIANCES', 'ORG-RELATIONS'],
  '/achievements': ['ORG-HISTORIES', 'ORG-STORIES', 'OPR-REPORTS'],
  '/visions': ['ORG-VISIONS', 'ORG-MISSIONS', 'ORG-SCENARIOS'],
  '/identity-management': ['ORG-ID-PASSPORT', 'ORG-ROLES', 'OPR-PERMISSIONS'],
};

// Error code to guide mapping for contextual error help
export const errorGuideMap: Record<string, string[]> = {
  'AUTH_ERROR': ['ORG-ID-PASSPORT', 'ORG-ROLES', 'OPR-PERMISSIONS'],
  'PERMISSION_DENIED': ['ORG-ROLES', 'OPR-PERMISSIONS', 'ORG-GOVERNANCE'],
  'VALIDATION_ERROR': ['OPR-DOCUMENTS', 'OPR-VERIFICATIONS', 'OPR-WORKFLOWS'],
  'API_ERROR': ['OPR-PROTOCOL', 'OPR-BUILDS', 'OPR-SUPPORTS'],
  'DATABASE_ERROR': ['OPR-BUILDS', 'OPR-SUPPORTS', 'OPR-PROTOCOL'],
  'NETWORK_ERROR': ['OPR-BUILDS', 'OPR-SUPPORTS', 'OPR-INFORMATION'],
  'FILE_UPLOAD_ERROR': ['OPR-DOCUMENTS', 'OPR-FORMS', 'OPR-SUPPORTS'],
  'WORKFLOW_ERROR': ['OPR-WORKFLOWS', 'OPR-TASKS', 'OPR-ACTIONS'],
  'TRACKING_ERROR': ['OPR-TRACKING', 'OPR-LOGISTICS', 'OPR-TRANSPORT'],
  'PAYMENT_ERROR': ['BUS-FINANCE', 'BUS-PAYMENT', 'BUS-TRADE'],
};

// Workflow procedures mapped to guides
export const workflowGuideMap: Record<string, { guides: string[], steps: string[] }> = {
  'shipment_creation': {
    guides: ['OPR-WORKFLOWS', 'OPR-TRACKING', 'OPR-DOCUMENTS'],
    steps: [
      'Verify customer information',
      'Create shipment record',
      'Generate tracking number',
      'Upload required documents',
      'Assign to carrier'
    ]
  },
  'invoice_generation': {
    guides: ['BUS-FINANCE', 'OPR-DOCUMENTS', 'BUS-PAYMENT'],
    steps: [
      'Calculate charges',
      'Apply taxes and fees', 
      'Generate invoice PDF',
      'Send to customer',
      'Update accounting records'
    ]
  },
  'customs_clearance': {
    guides: ['BUS-CUSTOMS', 'OPR-DOCUMENTS', 'BUS-TRADE'],
    steps: [
      'Prepare customs documentation',
      'Submit to authorities',
      'Track clearance status',
      'Handle queries',
      'Update shipment status'
    ]
  },
  'partner_onboarding': {
    guides: ['BUS-PARTNERSHIPS', 'OPR-VERIFICATIONS', 'OPR-DOCUMENTS'],
    steps: [
      'Collect partner information',
      'Verify credentials',
      'Create partner account',
      'Setup permissions',
      'Provide training materials'
    ]
  },
  'incident_management': {
    guides: ['OPR-SUPPORTS', 'OPR-REPORTS', 'OPR-ACTIONS'],
    steps: [
      'Log incident details',
      'Assess severity',
      'Notify stakeholders',
      'Implement resolution',
      'Document outcome'
    ]
  },
};

// Service to get relevant guides for current context
export class GuideContextService {
  static async getRelevantGuides(currentPath: string): Promise<string[]> {
    // Find the best matching path
    const matchingPath = Object.keys(guideContextMap).find(path => 
      currentPath.startsWith(path)
    ) || '/';
    
    return guideContextMap[matchingPath] || [];
  }
  
  static async getErrorGuides(errorCode: string): Promise<string[]> {
    return errorGuideMap[errorCode] || errorGuideMap['API_ERROR'];
  }
  
  static async getWorkflowGuide(workflowName: string) {
    return workflowGuideMap[workflowName] || null;
  }
  
  static getGuideUrl(guideCode: string): string {
    // Convert guide code to URL path
    return `/guides?search=${encodeURIComponent(guideCode)}`;
  }
  
  static async fetchGuidesByCode(guideCodes: string[]): Promise<Guide[]> {
    if (!guideCodes.length) return [];
    
    try {
      const response = await fetch('/api/guides/all');
      if (!response.ok) {
        // Failed to fetch guides
        return [];
      }
      
      const allGuides: Guide[] = await response.json();
      return allGuides.filter(guide => 
        guideCodes.includes(guide.code)
      );
    } catch (error) {
      // Error fetching guides
      return [];
    }
  }
}