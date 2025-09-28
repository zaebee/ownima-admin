export type Environment = 'development' | 'staging' | 'beta' | 'production';

export interface EnvironmentConfig {
  name: Environment;
  apiBaseUrl: string;
  displayName: string;
}

const environmentConfigs: Record<Environment, EnvironmentConfig> = {
  development: {
    name: 'development',
    apiBaseUrl: 'http://localhost:8000/api/v1',
    displayName: 'Local Development'
  },
  staging: {
    name: 'staging',
    apiBaseUrl: 'https://stage.ownima.com/api/v1',
    displayName: 'Staging'
  },
  beta: {
    name: 'beta',
    apiBaseUrl: 'https://beta.ownima.com/api/v1',
    displayName: 'Beta'
  },
  production: {
    name: 'production',
    apiBaseUrl: 'https://api.ownima.com/api/v1',
    displayName: 'Production'
  }
};

function detectEnvironment(): Environment {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_ENVIRONMENT || 'local';
  }

  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  }

  if (hostname.includes('stage.ownima.com')) {
    return 'staging';
  }

  if (hostname.includes('beta.ownima.com')) {
    return 'beta';
  }

  if (hostname.includes('ownima.com')) {
    return 'production';
  }

  return import.meta.env.VITE_ENVIRONMENT || 'beta';
}

export function getCurrentEnvironment(): Environment {
  const override = import.meta.env.VITE_ENVIRONMENT as Environment;
  if (override && environmentConfigs[override]) {
    return override;
  }

  return detectEnvironment();
}

export function getEnvironmentConfig(env?: Environment): EnvironmentConfig {
  const environment = env || getCurrentEnvironment();
  return environmentConfigs[environment];
}

export function getApiBaseUrl(env?: Environment): string {
  return getEnvironmentConfig(env).apiBaseUrl;
}

export { environmentConfigs };