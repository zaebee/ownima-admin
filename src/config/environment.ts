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
    displayName: 'Local Development',
  },
  staging: {
    name: 'staging',
    apiBaseUrl: 'https://stage.ownima.com/api/v1',
    displayName: 'Staging',
  },
  beta: {
    name: 'beta',
    apiBaseUrl: 'https://beta.ownima.com/api/v1',
    displayName: 'Beta',
  },
  production: {
    name: 'production',
    apiBaseUrl: 'https://api.ownima.com/api/v1',
    displayName: 'Production',
  },
};

function detectEnvironment(): Environment {
  if (typeof window === 'undefined') {
    return (import.meta.env.VITE_ENVIRONMENT as Environment) || 'development';
  }

  const hostname = window.location.hostname;

  // In test environment, hostname might be empty or 'localhost'
  if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
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

  const detected = detectEnvironment();
  return detected;
}

export function getEnvironmentConfig(env?: Environment): EnvironmentConfig {
  const environment = env || getCurrentEnvironment();
  return environmentConfigs[environment];
}

export function getApiBaseUrl(env?: Environment): string {
  // In test environment (Node.js without window), always use development
  if (typeof window === 'undefined' && !env) {
    return 'http://localhost:8000/api/v1';
  }
  const config = getEnvironmentConfig(env);
  return config.apiBaseUrl;
}

/**
 * Get the full avatar URL with the correct base URL for the current environment
 * @param avatarPath - Relative avatar path from the API (e.g., "/media/avatars/user123.jpg")
 * @returns Full avatar URL with environment-specific base URL
 */
export function getAvatarUrl(avatarPath?: string | null): string | undefined {
  if (!avatarPath) return undefined;

  // If it's already a full URL, return as-is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  const env = getCurrentEnvironment();

  // Get base domain URL (without /api/v1 suffix)
  let baseUrl: string;
  switch (env) {
    case 'staging':
      baseUrl = 'https://stage.ownima.com';
      break;
    case 'beta':
      baseUrl = 'https://beta.ownima.com';
      break;
    case 'production':
      baseUrl = 'https://ownima.com';
      break;
    case 'development':
    default:
      baseUrl = 'http://localhost:8000';
      break;
  }

  // Remove leading slash if present to avoid double slashes
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;

  return `${baseUrl}${cleanPath}`;
}

export { environmentConfigs };
