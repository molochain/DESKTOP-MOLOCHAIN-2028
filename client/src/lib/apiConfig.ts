const isProduction = import.meta.env.VITE_APP_ENV === 'production';

export const API_CONFIG = {
  CMS_BASE_URL: import.meta.env.VITE_API_CMS_BASE_URL || (isProduction ? 'https://cms.molochain.com/api' : '/api'),
  OTMS_BASE_URL: import.meta.env.VITE_API_OTMS_BASE_URL || (isProduction ? 'https://opt.molochain.com/v1' : '/api'),
  GODLAYER_BASE_URL: import.meta.env.VITE_API_GODLAYER_BASE_URL || (isProduction ? 'https://molochain.com/api' : '/api'),
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || (isProduction ? 'wss://molochain.com' : `ws://${window.location.host}`),
  APP_URL: import.meta.env.VITE_APP_URL || (isProduction ? 'https://molochain.com' : window.location.origin),
} as const;

export const getApiUrl = (service: 'cms' | 'otms' | 'godlayer', path: string = ''): string => {
  const baseUrls = {
    cms: API_CONFIG.CMS_BASE_URL,
    otms: API_CONFIG.OTMS_BASE_URL,
    godlayer: API_CONFIG.GODLAYER_BASE_URL,
  };
  return `${baseUrls[service]}${path}`;
};

export const getWsUrl = (path: string = ''): string => {
  return `${API_CONFIG.WS_BASE_URL}${path}`;
};

export const getDocumentationApiUrl = (): string => {
  if (!isProduction) {
    return window.location.origin;
  }
  const godlayerUrl = import.meta.env.VITE_API_GODLAYER_BASE_URL || 'https://molochain.com/api';
  return godlayerUrl.replace(/\/api$/, '');
};
