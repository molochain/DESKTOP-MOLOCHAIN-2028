import { Request, Response, NextFunction } from 'express';
import { createLoggerWithContext } from '../utils/logger.js';

const logger = createLoggerWithContext('api-version');

export interface VersionedRequest extends Request {
  apiVersion?: string;
  acceptedVersion?: string;
}

const supportedVersions = ['v1', 'v2'];
const defaultVersion = 'v1';
const deprecatedVersions = new Set<string>(['v0']);
const sunsetVersions = new Map<string, Date>([
  ['v0', new Date('2025-06-01')]
]);

export function apiVersioningMiddleware() {
  return (req: VersionedRequest, res: Response, next: NextFunction) => {
    let version = defaultVersion;
    
    const pathMatch = req.path.match(/^\/api\/(v\d+)\//);
    if (pathMatch) {
      version = pathMatch[1];
    }
    
    const headerVersion = req.get('X-API-Version') || req.get('Accept-Version');
    if (headerVersion && supportedVersions.includes(headerVersion)) {
      version = headerVersion;
    }
    
    const queryVersion = req.query.version as string;
    if (queryVersion && supportedVersions.includes(queryVersion)) {
      version = queryVersion;
    }
    
    if (!supportedVersions.includes(version)) {
      logger.warn('Unsupported API version requested', {
        requestedVersion: version,
        supportedVersions,
        path: req.path
      });
      
      return res.status(400).json({
        error: 'Bad Request',
        message: `API version '${version}' is not supported. Supported versions: ${supportedVersions.join(', ')}`,
        supportedVersions
      });
    }
    
    if (deprecatedVersions.has(version)) {
      res.set('Deprecation', 'true');
      res.set('X-API-Deprecated', 'true');
      
      const sunset = sunsetVersions.get(version);
      if (sunset) {
        res.set('Sunset', sunset.toUTCString());
      }
      
      logger.info('Deprecated API version used', {
        version,
        path: req.path,
        sunset: sunset?.toISOString()
      });
    }
    
    req.apiVersion = version;
    res.set('X-API-Version', version);
    
    next();
  };
}

export function requireVersion(minVersion: string) {
  const minVersionNum = parseInt(minVersion.replace('v', ''), 10);
  
  return (req: VersionedRequest, res: Response, next: NextFunction) => {
    const currentVersion = req.apiVersion || defaultVersion;
    const currentVersionNum = parseInt(currentVersion.replace('v', ''), 10);
    
    if (currentVersionNum < minVersionNum) {
      return res.status(400).json({
        error: 'Version Not Supported',
        message: `This endpoint requires API version ${minVersion} or higher. Current: ${currentVersion}`,
        currentVersion,
        requiredVersion: minVersion
      });
    }
    
    next();
  };
}

export function getVersionInfo(): {
  current: string;
  supported: string[];
  deprecated: string[];
  sunset: Record<string, string>;
} {
  const sunset: Record<string, string> = {};
  sunsetVersions.forEach((date, version) => {
    sunset[version] = date.toISOString();
  });
  
  return {
    current: defaultVersion,
    supported: supportedVersions,
    deprecated: Array.from(deprecatedVersions),
    sunset
  };
}
