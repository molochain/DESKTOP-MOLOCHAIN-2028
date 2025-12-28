import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { logger } from './logger';

interface DependencyInfo {
  name: string;
  version: string;
  isUsed: boolean;
  isDev: boolean;
  lastUsed?: Date;
  size?: number;
}

export class DependencyAuditor {
  private packageJsonPath: string;
  private sourceFiles: string[] = [];
  private dependencies: Map<string, DependencyInfo> = new Map();
  
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.scanSourceFiles();
    this.loadDependencies();
  }
  
  private scanSourceFiles() {
    const scanDirectory = (dir: string) => {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
          scanDirectory(filePath);
        } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))) {
          this.sourceFiles.push(filePath);
        }
      }
    };
    
    scanDirectory(path.join(process.cwd(), 'client'));
    scanDirectory(path.join(process.cwd(), 'server'));
    scanDirectory(path.join(process.cwd(), 'shared'));
  }
  
  private loadDependencies() {
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    
    // Load regular dependencies
    for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
      this.dependencies.set(name, {
        name,
        version: version as string,
        isUsed: false,
        isDev: false
      });
    }
    
    // Load dev dependencies
    for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
      this.dependencies.set(name, {
        name,
        version: version as string,
        isUsed: false,
        isDev: true
      });
    }
  }
  
  public audit(): { unused: string[], redundant: string[], suggestions: string[] } {
    const unused: string[] = [];
    const redundant: string[] = [];
    const suggestions: string[] = [];
    
    // Check which dependencies are actually imported
    for (const filePath of this.sourceFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      for (const [name, info] of this.dependencies) {
        // Check for various import patterns
        const patterns = [
          `from '${name}'`,
          `from "${name}"`,
          `require('${name}')`,
          `require("${name}")`,
          `import '${name}'`,
          `import "${name}"`
        ];
        
        if (patterns.some(pattern => content.includes(pattern))) {
          info.isUsed = true;
        }
      }
    }
    
    // Identify unused dependencies
    for (const [name, info] of this.dependencies) {
      if (!info.isUsed) {
        // Skip core dependencies that might not be directly imported
        const corePackages = [
          'typescript', 'vite', 'tsx', 'esbuild', 'postcss', 
          'tailwindcss', 'autoprefixer', '@types/', 'eslint'
        ];
        
        if (!corePackages.some(core => name.includes(core))) {
          unused.push(name);
        }
      }
    }
    
    // Identify redundant packages (multiple packages for same purpose)
    const uiLibraries = Array.from(this.dependencies.keys()).filter(name => 
      name.includes('ui') || name.includes('component') || name.includes('radix')
    );
    
    if (uiLibraries.length > 10) {
      suggestions.push(`Consider consolidating UI libraries. Found ${uiLibraries.length} UI-related packages.`);
    }
    
    // Check for multiple testing frameworks
    const testingLibs = Array.from(this.dependencies.keys()).filter(name => 
      name.includes('test') || name.includes('jest') || name.includes('mocha') || name.includes('chai')
    );
    
    if (testingLibs.length > 2) {
      redundant.push(...testingLibs);
      suggestions.push('Multiple testing frameworks detected. Consider standardizing on one.');
    }
    
    // Check for outdated packages
    try {
      const outdatedOutput = execSync('npm outdated --json', { encoding: 'utf8' });
      if (outdatedOutput) {
        const outdated = JSON.parse(outdatedOutput);
        const majorUpdates = Object.keys(outdated).filter(pkg => {
          const current = outdated[pkg].current;
          const latest = outdated[pkg].latest;
          return current && latest && current.split('.')[0] !== latest.split('.')[0];
        });
        
        if (majorUpdates.length > 0) {
          suggestions.push(`${majorUpdates.length} packages have major version updates available.`);
        }
      }
    } catch (error) {
      // npm outdated returns non-zero exit code when packages are outdated
      // This is expected behavior
    }
    
    return { unused, redundant, suggestions };
  }
  
  public generateReport(): string {
    const { unused, redundant, suggestions } = this.audit();
    
    let report = '# Dependency Audit Report\n\n';
    
    if (unused.length > 0) {
      report += '## Potentially Unused Dependencies\n';
      unused.forEach(dep => {
        report += `- ${dep}\n`;
      });
      report += '\n';
    }
    
    if (redundant.length > 0) {
      report += '## Redundant Dependencies\n';
      redundant.forEach(dep => {
        report += `- ${dep}\n`;
      });
      report += '\n';
    }
    
    if (suggestions.length > 0) {
      report += '## Suggestions\n';
      suggestions.forEach(suggestion => {
        report += `- ${suggestion}\n`;
      });
    }
    
    report += `\n## Summary\n`;
    report += `- Total dependencies: ${this.dependencies.size}\n`;
    report += `- Unused: ${unused.length}\n`;
    report += `- Redundant: ${redundant.length}\n`;
    
    return report;
  }
}

// Export function to run audit
export const runDependencyAudit = () => {
  const auditor = new DependencyAuditor();
  const report = auditor.generateReport();
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'dependency-audit.md');
  fs.writeFileSync(reportPath, report);
  
  logger.info('Dependency audit completed. Report saved to dependency-audit.md');
  
  return report;
};