import { describe, it, expect } from 'vitest';
import {
  normalizeAdminUser,
  normalizeRiderUser,
  normalizeActivityLog,
  normalizeAdminUsers,
  normalizeRiderUsers,
  normalizeActivityLogs,
  getUserDisplayName,
  getUserInitials,
  getUserType,
} from './dataNormalization';
import type { AdminUserFromAPI, RiderUserAdminFromAPI, ActivityLogFromAPI } from '../types/api';

// Mock data helpers
const createMockAdminUser = (overrides?: Partial<AdminUserFromAPI>): AdminUserFromAPI => ({
  id: 'user-123',
  email: 'john@example.com',
  role: 'OWNER',
  full_name: 'John Doe',
  phone_number: '+1234567890',
  is_active: true,
  is_superuser: false,
  is_beta_tester: false,
  avatar: null,
  currency: 'USD',
  language: 'en',
  location: 'New York',
  created_at: '2024-01-15T08:00:00Z',
  last_login_at: '2024-11-16T10:30:00Z',
  login_count: 42,
  ...overrides,
});

const createMockRiderUser = (overrides?: Partial<RiderUserAdminFromAPI>): RiderUserAdminFromAPI => ({
  id: 'rider-456',
  email: 'jane@example.com',
  full_name: 'Jane Smith',
  phone_number: '+9876543210',
  is_active: true,
  is_superuser: false,
  is_beta_tester: true,
  avatar: null,
  currency: 'EUR',
  language: 'en',
  location: 'London',
  created_at: '2024-03-20T12:00:00Z',
  last_login_at: '2024-11-15T09:00:00Z',
  login_count: 15,
  ...overrides,
});

const createMockActivityLog = (overrides?: Partial<ActivityLogFromAPI>): ActivityLogFromAPI => ({
  id: 'activity-789',
  type: 'registration',
  user_id: 'user-123',
  user_email: 'john@example.com',
  description: 'User registered',
  timestamp: '2024-11-16T10:00:00Z',
  ...overrides,
});

describe('dataNormalization', () => {
  describe('normalizeAdminUser', () => {
    it('renames phone_number to phone', () => {
      const apiUser = createMockAdminUser({ phone_number: '+1234567890' });
      const normalized = normalizeAdminUser(apiUser);

      expect(normalized.phone).toBe('+1234567890');
    });

    it('renames last_login_at to last_login', () => {
      const apiUser = createMockAdminUser({ last_login_at: '2024-11-16T10:00:00Z' });
      const normalized = normalizeAdminUser(apiUser);

      expect(normalized.last_login).toBe('2024-11-16T10:00:00Z');
    });

    it('renames created_at to registration_date', () => {
      const apiUser = createMockAdminUser({ created_at: '2024-01-15T08:00:00Z' });
      const normalized = normalizeAdminUser(apiUser);

      expect(normalized.registration_date).toBe('2024-01-15T08:00:00Z');
    });

    it('derives user_type from role', () => {
      const ownerUser = createMockAdminUser({ role: 'OWNER' });
      const normalized = normalizeAdminUser(ownerUser);

      expect(normalized.user_type).toBe('OWNER');
    });

    it('sets user_type to RIDER when role is RIDER', () => {
      const riderUser = createMockAdminUser({ role: 'RIDER' });
      const normalized = normalizeAdminUser(riderUser);

      expect(normalized.user_type).toBe('RIDER');
    });

    it('uses filter context when role is undefined', () => {
      const apiUser = createMockAdminUser({ role: undefined });
      const normalized = normalizeAdminUser(apiUser, 'RIDER');

      expect(normalized.user_type).toBe('RIDER');
    });

    it('handles null phone_number', () => {
      const apiUser = createMockAdminUser({ phone_number: null });
      const normalized = normalizeAdminUser(apiUser);

      expect(normalized.phone).toBeNull();
    });

    it('handles null last_login_at', () => {
      const apiUser = createMockAdminUser({ last_login_at: null });
      const normalized = normalizeAdminUser(apiUser);

      expect(normalized.last_login).toBeNull();
    });

    it('preserves all original fields', () => {
      const apiUser = createMockAdminUser();
      const normalized = normalizeAdminUser(apiUser);

      expect(normalized.id).toBe(apiUser.id);
      expect(normalized.email).toBe(apiUser.email);
      expect(normalized.full_name).toBe(apiUser.full_name);
      expect(normalized.is_active).toBe(apiUser.is_active);
      expect(normalized.is_superuser).toBe(apiUser.is_superuser);
      expect(normalized.is_beta_tester).toBe(apiUser.is_beta_tester);
    });

    it('handles filter ALL (no user_type set)', () => {
      const apiUser = createMockAdminUser({ role: undefined });
      const normalized = normalizeAdminUser(apiUser, 'ALL');

      expect(normalized.user_type).toBeUndefined();
    });

    it('handles filter OWNER', () => {
      const apiUser = createMockAdminUser({ role: undefined });
      const normalized = normalizeAdminUser(apiUser, 'OWNER');

      expect(normalized.user_type).toBeUndefined();
    });
  });

  describe('normalizeRiderUser', () => {
    it('always sets user_type to RIDER', () => {
      const apiRider = createMockRiderUser();
      const normalized = normalizeRiderUser(apiRider);

      expect(normalized.user_type).toBe('RIDER');
    });

    it('renames phone_number to phone', () => {
      const apiRider = createMockRiderUser({ phone_number: '+9876543210' });
      const normalized = normalizeRiderUser(apiRider);

      expect(normalized.phone).toBe('+9876543210');
    });

    it('renames last_login_at to last_login', () => {
      const apiRider = createMockRiderUser({ last_login_at: '2024-11-15T09:00:00Z' });
      const normalized = normalizeRiderUser(apiRider);

      expect(normalized.last_login).toBe('2024-11-15T09:00:00Z');
    });

    it('renames created_at to registration_date', () => {
      const apiRider = createMockRiderUser({ created_at: '2024-03-20T12:00:00Z' });
      const normalized = normalizeRiderUser(apiRider);

      expect(normalized.registration_date).toBe('2024-03-20T12:00:00Z');
    });

    it('handles rating field as null when not present', () => {
      const apiRider = createMockRiderUser();
      const normalized = normalizeRiderUser(apiRider);

      expect(normalized.rating).toBeNull();
    });

    it('handles rating field when present', () => {
      const apiRider = { ...createMockRiderUser(), rating: 4.5 } as unknown as RiderUserAdminFromAPI;
      const normalized = normalizeRiderUser(apiRider);

      expect(normalized.rating).toBe(4.5);
    });

    it('preserves all original fields', () => {
      const apiRider = createMockRiderUser();
      const normalized = normalizeRiderUser(apiRider);

      expect(normalized.id).toBe(apiRider.id);
      expect(normalized.email).toBe(apiRider.email);
      expect(normalized.full_name).toBe(apiRider.full_name);
      expect(normalized.is_active).toBe(apiRider.is_active);
      expect(normalized.is_beta_tester).toBe(apiRider.is_beta_tester);
    });

    it('handles null phone_number', () => {
      const apiRider = createMockRiderUser({ phone_number: null });
      const normalized = normalizeRiderUser(apiRider);

      expect(normalized.phone).toBeNull();
    });
  });

  describe('normalizeActivityLog', () => {
    it('converts type to uppercase', () => {
      const apiActivity = createMockActivityLog({ type: 'registration' });
      const normalized = normalizeActivityLog(apiActivity);

      expect(normalized.type).toBe('REGISTRATION');
    });

    it('handles already uppercase type', () => {
      const apiActivity = createMockActivityLog({ type: 'LOGIN' });
      const normalized = normalizeActivityLog(apiActivity);

      expect(normalized.type).toBe('LOGIN');
    });

    it('preserves all other fields', () => {
      const apiActivity = createMockActivityLog();
      const normalized = normalizeActivityLog(apiActivity);

      expect(normalized.id).toBe(apiActivity.id);
      expect(normalized.user_id).toBe(apiActivity.user_id);
      expect(normalized.user_email).toBe(apiActivity.user_email);
      expect(normalized.description).toBe(apiActivity.description);
      expect(normalized.timestamp).toBe(apiActivity.timestamp);
    });

    it('handles different activity types', () => {
      const loginActivity = createMockActivityLog({ type: 'login' });
      const bookingActivity = createMockActivityLog({ type: 'booking' });

      expect(normalizeActivityLog(loginActivity).type).toBe('LOGIN');
      expect(normalizeActivityLog(bookingActivity).type).toBe('BOOKING');
    });
  });

  describe('normalizeAdminUsers', () => {
    it('normalizes array of users', () => {
      const apiUsers = [
        createMockAdminUser({ id: 'user-1', email: 'user1@example.com' }),
        createMockAdminUser({ id: 'user-2', email: 'user2@example.com' }),
        createMockAdminUser({ id: 'user-3', email: 'user3@example.com' }),
      ];

      const normalized = normalizeAdminUsers(apiUsers);

      expect(normalized).toHaveLength(3);
      expect(normalized[0].id).toBe('user-1');
      expect(normalized[1].id).toBe('user-2');
      expect(normalized[2].id).toBe('user-3');
    });

    it('applies userTypeFilter to all users', () => {
      const apiUsers = [
        createMockAdminUser({ id: 'user-1', role: undefined }),
        createMockAdminUser({ id: 'user-2', role: undefined }),
      ];

      const normalized = normalizeAdminUsers(apiUsers, 'RIDER');

      expect(normalized[0].user_type).toBe('RIDER');
      expect(normalized[1].user_type).toBe('RIDER');
    });

    it('handles empty array', () => {
      const normalized = normalizeAdminUsers([]);
      expect(normalized).toEqual([]);
    });

    it('preserves array order', () => {
      const apiUsers = [
        createMockAdminUser({ email: 'a@example.com' }),
        createMockAdminUser({ email: 'b@example.com' }),
        createMockAdminUser({ email: 'c@example.com' }),
      ];

      const normalized = normalizeAdminUsers(apiUsers);

      expect(normalized[0].email).toBe('a@example.com');
      expect(normalized[1].email).toBe('b@example.com');
      expect(normalized[2].email).toBe('c@example.com');
    });
  });

  describe('normalizeRiderUsers', () => {
    it('normalizes array of riders', () => {
      const apiRiders = [
        createMockRiderUser({ id: 'rider-1' }),
        createMockRiderUser({ id: 'rider-2' }),
        createMockRiderUser({ id: 'rider-3' }),
      ];

      const normalized = normalizeRiderUsers(apiRiders);

      expect(normalized).toHaveLength(3);
      expect(normalized[0].user_type).toBe('RIDER');
      expect(normalized[1].user_type).toBe('RIDER');
      expect(normalized[2].user_type).toBe('RIDER');
    });

    it('handles empty array', () => {
      const normalized = normalizeRiderUsers([]);
      expect(normalized).toEqual([]);
    });
  });

  describe('normalizeActivityLogs', () => {
    it('normalizes array of activity logs', () => {
      const apiActivities = [
        createMockActivityLog({ type: 'registration' }),
        createMockActivityLog({ type: 'login' }),
        createMockActivityLog({ type: 'booking' }),
      ];

      const normalized = normalizeActivityLogs(apiActivities);

      expect(normalized).toHaveLength(3);
      expect(normalized[0].type).toBe('REGISTRATION');
      expect(normalized[1].type).toBe('LOGIN');
      expect(normalized[2].type).toBe('BOOKING');
    });

    it('handles empty array', () => {
      const normalized = normalizeActivityLogs([]);
      expect(normalized).toEqual([]);
    });
  });

  describe('getUserDisplayName', () => {
    it('returns full_name when available', () => {
      const user = { full_name: 'John Doe', email: 'john@example.com' };
      const displayName = getUserDisplayName(user);

      expect(displayName).toBe('John Doe');
    });

    it('returns email username when full_name is null', () => {
      const user = { full_name: null, email: 'john.doe@example.com' };
      const displayName = getUserDisplayName(user);

      expect(displayName).toBe('john.doe');
    });

    it('returns email username when full_name is undefined', () => {
      const user = { full_name: undefined, email: 'jane.smith@example.com' };
      const displayName = getUserDisplayName(user);

      expect(displayName).toBe('jane.smith');
    });

    it('returns full email when username extraction fails', () => {
      const user = { full_name: null, email: '' };
      const displayName = getUserDisplayName(user);

      expect(displayName).toBe('');
    });

    it('handles email without @ symbol', () => {
      const user = { full_name: null, email: 'invalidemail' };
      const displayName = getUserDisplayName(user);

      expect(displayName).toBe('invalidemail');
    });

    it('handles empty full_name string', () => {
      const user = { full_name: '', email: 'test@example.com' };
      const displayName = getUserDisplayName(user);

      expect(displayName).toBe('test');
    });
  });

  describe('getUserInitials', () => {
    it('returns first letter of full_name', () => {
      const user = { full_name: 'John Doe', email: 'john@example.com' };
      const initials = getUserInitials(user);

      expect(initials).toBe('J');
    });

    it('returns first letter of email when full_name is null', () => {
      const user = { full_name: null, email: 'alice@example.com' };
      const initials = getUserInitials(user);

      expect(initials).toBe('A');
    });

    it('returns uppercase letter', () => {
      const user = { full_name: 'bob', email: 'bob@example.com' };
      const initials = getUserInitials(user);

      expect(initials).toBe('B');
    });

    it('handles email starting with lowercase', () => {
      const user = { full_name: null, email: 'test@example.com' };
      const initials = getUserInitials(user);

      expect(initials).toBe('T');
    });

    it('handles single character full_name', () => {
      const user = { full_name: 'X', email: 'x@example.com' };
      const initials = getUserInitials(user);

      expect(initials).toBe('X');
    });
  });

  describe('getUserType', () => {
    it('returns OWNER for OWNER role', () => {
      expect(getUserType('OWNER')).toBe('OWNER');
    });

    it('returns RIDER for RIDER role', () => {
      expect(getUserType('RIDER')).toBe('RIDER');
    });

    it('returns undefined for unknown role', () => {
      expect(getUserType('ADMIN')).toBeUndefined();
    });

    it('returns undefined for undefined role', () => {
      expect(getUserType(undefined)).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(getUserType('')).toBeUndefined();
    });

    it('is case-sensitive', () => {
      expect(getUserType('owner')).toBeUndefined();
      expect(getUserType('rider')).toBeUndefined();
    });
  });

  describe('Integration: Complete normalization flow', () => {
    it('normalizes mixed user types correctly', () => {
      const apiUsers = [
        createMockAdminUser({ id: 'owner-1', role: 'OWNER', email: 'owner@example.com' }),
        createMockAdminUser({ id: 'rider-1', role: 'RIDER', email: 'rider@example.com' }),
        createMockAdminUser({ id: 'unknown-1', role: undefined, email: 'unknown@example.com' }),
      ];

      const normalized = normalizeAdminUsers(apiUsers);

      expect(normalized[0].user_type).toBe('OWNER');
      expect(normalized[1].user_type).toBe('RIDER');
      expect(normalized[2].user_type).toBeUndefined();
    });

    it('handles complete rider normalization with helpers', () => {
      const apiRider = createMockRiderUser({
        full_name: 'Jane Smith',
        email: 'jane@example.com',
      });

      const normalized = normalizeRiderUser(apiRider);
      const displayName = getUserDisplayName(normalized);
      const initials = getUserInitials(normalized);

      expect(normalized.user_type).toBe('RIDER');
      expect(displayName).toBe('Jane Smith');
      expect(initials).toBe('J');
    });

    it('handles user without full_name gracefully', () => {
      const apiUser = createMockAdminUser({
        full_name: null,
        email: 'test.user@example.com',
      });

      const normalized = normalizeAdminUser(apiUser);
      const displayName = getUserDisplayName(normalized);
      const initials = getUserInitials(normalized);

      expect(displayName).toBe('test.user');
      expect(initials).toBe('T');
    });
  });
});
