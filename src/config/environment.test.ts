import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCurrentEnvironment,
  getEnvironmentConfig,
  getApiBaseUrl,
  getAvatarUrl,
  type Environment,
} from './environment';

describe('environment', () => {
  beforeEach(() => {
    // Clear any environment overrides
    vi.unstubAllEnvs();
  });

  describe('getCurrentEnvironment', () => {
    it('returns override from VITE_ENVIRONMENT', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'staging');
      expect(getCurrentEnvironment()).toBe('staging');
    });

    it('returns development for localhost', () => {
      vi.stubEnv('VITE_ENVIRONMENT', '');
      Object.defineProperty(window, 'location', {
        value: { hostname: 'localhost' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('development');
    });

    it('returns development for 127.0.0.1', () => {
      vi.stubEnv('VITE_ENVIRONMENT', '');
      Object.defineProperty(window, 'location', {
        value: { hostname: '127.0.0.1' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('development');
    });

    it('returns staging for stage.ownima.com', () => {
      vi.stubEnv('VITE_ENVIRONMENT', '');
      Object.defineProperty(window, 'location', {
        value: { hostname: 'stage.ownima.com' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('staging');
    });

    it('returns beta for beta.ownima.com', () => {
      vi.stubEnv('VITE_ENVIRONMENT', '');
      Object.defineProperty(window, 'location', {
        value: { hostname: 'beta.ownima.com' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('beta');
    });

    it('returns production for ownima.com', () => {
      vi.stubEnv('VITE_ENVIRONMENT', '');
      Object.defineProperty(window, 'location', {
        value: { hostname: 'ownima.com' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('production');
    });

    it('returns beta as default', () => {
      vi.stubEnv('VITE_ENVIRONMENT', '');
      Object.defineProperty(window, 'location', {
        value: { hostname: 'unknown.com' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('beta');
    });
  });

  describe('getEnvironmentConfig', () => {
    it('returns development config', () => {
      const config = getEnvironmentConfig('development');
      expect(config.name).toBe('development');
      expect(config.apiBaseUrl).toBe('http://localhost:8000/api/v1');
      expect(config.displayName).toBe('Local Development');
    });

    it('returns staging config', () => {
      const config = getEnvironmentConfig('staging');
      expect(config.name).toBe('staging');
      expect(config.apiBaseUrl).toBe('https://stage.ownima.com/api/v1');
      expect(config.displayName).toBe('Staging');
    });

    it('returns beta config', () => {
      const config = getEnvironmentConfig('beta');
      expect(config.name).toBe('beta');
      expect(config.apiBaseUrl).toBe('https://beta.ownima.com/api/v1');
      expect(config.displayName).toBe('Beta');
    });

    it('returns production config', () => {
      const config = getEnvironmentConfig('production');
      expect(config.name).toBe('production');
      expect(config.apiBaseUrl).toBe('https://api.ownima.com/api/v1');
      expect(config.displayName).toBe('Production');
    });

    it('uses current environment when no env specified', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'staging');
      const config = getEnvironmentConfig();
      expect(config.name).toBe('staging');
    });
  });

  describe('getApiBaseUrl', () => {
    it('returns development URL for development env', () => {
      const url = getApiBaseUrl('development');
      expect(url).toBe('http://localhost:8000/api/v1');
    });

    it('returns staging URL for staging env', () => {
      const url = getApiBaseUrl('staging');
      expect(url).toBe('https://stage.ownima.com/api/v1');
    });

    it('returns beta URL for beta env', () => {
      const url = getApiBaseUrl('beta');
      expect(url).toBe('https://beta.ownima.com/api/v1');
    });

    it('returns production URL for production env', () => {
      const url = getApiBaseUrl('production');
      expect(url).toBe('https://api.ownima.com/api/v1');
    });

    it('uses current environment when no env specified', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'beta');
      const url = getApiBaseUrl();
      expect(url).toBe('https://beta.ownima.com/api/v1');
    });
  });

  describe('getAvatarUrl', () => {
    it('returns undefined for null path', () => {
      expect(getAvatarUrl(null)).toBeUndefined();
    });

    it('returns undefined for undefined path', () => {
      expect(getAvatarUrl(undefined)).toBeUndefined();
    });

    it('returns full URL as-is if already absolute', () => {
      const url = 'https://example.com/avatar.jpg';
      expect(getAvatarUrl(url)).toBe(url);
    });

    it('returns http URL as-is if already absolute', () => {
      const url = 'http://example.com/avatar.jpg';
      expect(getAvatarUrl(url)).toBe(url);
    });

    it('constructs development URL', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'development');
      const url = getAvatarUrl('/media/avatars/user123.jpg');
      expect(url).toBe('http://localhost:8000/media/avatars/user123.jpg');
    });

    it('constructs staging URL', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'staging');
      const url = getAvatarUrl('/media/avatars/user123.jpg');
      expect(url).toBe('https://stage.ownima.com/media/avatars/user123.jpg');
    });

    it('constructs beta URL', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'beta');
      const url = getAvatarUrl('/media/avatars/user123.jpg');
      expect(url).toBe('https://beta.ownima.com/media/avatars/user123.jpg');
    });

    it('constructs production URL', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'production');
      const url = getAvatarUrl('/media/avatars/user123.jpg');
      expect(url).toBe('https://ownima.com/media/avatars/user123.jpg');
    });

    it('handles path without leading slash', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'development');
      const url = getAvatarUrl('media/avatars/user123.jpg');
      expect(url).toBe('http://localhost:8000/media/avatars/user123.jpg');
    });

    it('handles path with leading slash', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'development');
      const url = getAvatarUrl('/media/avatars/user123.jpg');
      expect(url).toBe('http://localhost:8000/media/avatars/user123.jpg');
    });
  });

  describe('Environment Types', () => {
    it('accepts all valid environment types', () => {
      const environments: Environment[] = ['development', 'staging', 'beta', 'production'];

      environments.forEach((env) => {
        const config = getEnvironmentConfig(env);
        expect(config.name).toBe(env);
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty hostname', () => {
      vi.stubEnv('VITE_ENVIRONMENT', '');
      Object.defineProperty(window, 'location', {
        value: { hostname: '' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('development');
    });

    it('handles subdomain variations', () => {
      vi.stubEnv('VITE_ENVIRONMENT', '');
      Object.defineProperty(window, 'location', {
        value: { hostname: 'app.stage.ownima.com' },
        writable: true,
      });
      expect(getCurrentEnvironment()).toBe('staging');
    });

    it('handles avatar path with query parameters', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'development');
      const url = getAvatarUrl('/media/avatars/user123.jpg?v=1');
      expect(url).toBe('http://localhost:8000/media/avatars/user123.jpg?v=1');
    });

    it('handles avatar path with special characters', () => {
      vi.stubEnv('VITE_ENVIRONMENT', 'development');
      const url = getAvatarUrl('/media/avatars/user%20name.jpg');
      expect(url).toBe('http://localhost:8000/media/avatars/user%20name.jpg');
    });
  });
});
