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
    apiBaseUrl: 'https://beta.ownima.com/api/v1',
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
 * Get the base domain URL for the current environment (without /api/v1 suffix)
 * @param env - Optional environment override
 * @returns Base domain URL
 */
function getBaseDomainUrl(env?: Environment): string {
  const environment = env || getCurrentEnvironment();

  switch (environment) {
    case 'staging':
      return 'https://stage.ownima.com';
    case 'beta':
      return 'https://beta.ownima.com';
    case 'production':
      return 'https://beta.ownima.com';
    case 'development':
    default:
      return 'http://localhost:8000';
  }
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

  const baseUrl = getBaseDomainUrl();

  // Remove leading slash if present to avoid double slashes
  const cleanPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;

  return `${baseUrl}${cleanPath}`;
}

/**
 * Get the full vehicle image URL with the correct base URL for the current environment
 * @param imagePath - Relative image path from the API (e.g., "/vehicles/{id}/{photo}.jpg")
 * @returns Full image URL with environment-specific base URL
 */
export function getVehicleImageUrl(imagePath?: string | null): string | undefined {
  if (!imagePath) return undefined;

  // If it's already a full URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const baseUrl = getBaseDomainUrl();

  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${baseUrl}${cleanPath}`;
}

export { environmentConfigs };
