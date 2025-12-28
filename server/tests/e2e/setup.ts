import axios, { AxiosInstance, AxiosResponse } from 'axios';

export const PRODUCTION_BASE_URL = 'https://molochain.com';
export const CMS_BASE_URL = 'https://cms.molochain.com';

export const E2E_TIMEOUTS = {
  SHORT: 10000,
  MEDIUM: 20000,
  LONG: 30000,
  NETWORK: 15000,
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES = 3;
const RETRY_COUNT_HEADER = 'x-retry-count';

export function createHttpClient(baseURL: string, timeout: number = E2E_TIMEOUTS.NETWORK): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Molochain-E2E-Tests/1.0',
    },
    validateStatus: () => true,
  });

  client.interceptors.response.use(
    async (response) => {
      if (response.status === 429) {
        const retryCount = parseInt((response.config.headers?.[RETRY_COUNT_HEADER] as string) || '0', 10);
        
        if (retryCount >= MAX_RETRIES) {
          return response;
        }
        
        const retryAfter = Math.min(parseInt(response.headers['retry-after'] || '2', 10), 5);
        await sleep(retryAfter * 1000);
        
        return client.request({
          ...response.config,
          headers: {
            ...response.config.headers,
            [RETRY_COUNT_HEADER]: String(retryCount + 1),
          },
        });
      }
      return response;
    },
    (error) => Promise.reject(error)
  );

  return client;
}

export const productionClient = createHttpClient(PRODUCTION_BASE_URL);
export const cmsClient = createHttpClient(CMS_BASE_URL);

export function isRateLimited(status: number): boolean {
  return status === 429;
}

export function isSuccessOrRateLimited(status: number): boolean {
  return status === 200 || status === 429;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateResponseStructure(data: any, requiredFields: string[]): ValidationResult {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    const keys = field.split('.');
    let current = data;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        errors.push(`Missing required field: ${field}`);
        break;
      }
      current = current[key];
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateArrayResponse(data: any, minLength: number = 0): ValidationResult {
  const errors: string[] = [];
  
  if (!Array.isArray(data)) {
    errors.push('Response is not an array');
  } else if (data.length < minLength) {
    errors.push(`Array length ${data.length} is less than minimum ${minLength}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

export function validateHealthResponse(data: any): ValidationResult {
  const requiredFields = ['status', 'timestamp'];
  return validateResponseStructure(data, requiredFields);
}

export function validateServiceData(service: any): ValidationResult {
  const requiredFields = ['id', 'name'];
  return validateResponseStructure(service, requiredFields);
}

export function validatePartnerData(partner: any): ValidationResult {
  const requiredFields = ['id', 'name'];
  return validateResponseStructure(partner, requiredFields);
}

export function validateRegionData(region: any): ValidationResult {
  const requiredFields = ['id', 'name'];
  return validateResponseStructure(region, requiredFields);
}

export function isValidTimestamp(timestamp: string): boolean {
  const date = new Date(timestamp);
  return !isNaN(date.getTime());
}

export function isValidHttpStatus(status: number): boolean {
  return status >= 100 && status <= 599;
}

export async function checkEndpointAccessibility(url: string, timeout: number = E2E_TIMEOUTS.NETWORK): Promise<boolean> {
  try {
    const response = await axios.get(url, { timeout, validateStatus: () => true });
    return response.status >= 200 && response.status < 500;
  } catch (error) {
    return false;
  }
}

export function logTestResult(testName: string, passed: boolean, details?: any): void {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${testName}`);
  if (details && !passed) {
    console.log('  Details:', JSON.stringify(details, null, 2));
  }
}
