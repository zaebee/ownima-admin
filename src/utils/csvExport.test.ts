import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  convertToCSV,
  downloadCSV,
  formatDateForCSV,
  formatDateTimeForCSV,
} from './csvExport';

describe('csvExport', () => {
  describe('convertToCSV', () => {
    it('converts array of objects to CSV format', () => {
      const data = [
        { name: 'John', age: 30, city: 'New York' },
        { name: 'Jane', age: 25, city: 'Los Angeles' },
      ];

      const csv = convertToCSV(data);

      expect(csv).toBe('name,age,city\nJohn,30,New York\nJane,25,Los Angeles');
    });

    it('handles empty array', () => {
      const data: Record<string, unknown>[] = [];
      const csv = convertToCSV(data);

      expect(csv).toBe('');
    });

    it('escapes fields with commas', () => {
      const data = [{ name: 'Doe, John', position: 'Developer' }];
      const csv = convertToCSV(data);

      expect(csv).toContain('"Doe, John"');
    });

    it('escapes fields with quotes', () => {
      const data = [{ message: 'He said "hello"' }];
      const csv = convertToCSV(data);

      expect(csv).toContain('"He said ""hello"""');
    });

    it('escapes fields with newlines', () => {
      const data = [{ address: 'Line 1\nLine 2' }];
      const csv = convertToCSV(data);

      expect(csv).toContain('"Line 1\nLine 2"');
    });

    it('handles null values', () => {
      const data = [{ name: 'John', email: null }];
      const csv = convertToCSV(data);

      expect(csv).toBe('name,email\nJohn,');
    });

    it('handles undefined values', () => {
      const data = [{ name: 'John', phone: undefined }];
      const csv = convertToCSV(data);

      expect(csv).toBe('name,phone\nJohn,');
    });

    it('handles numeric values', () => {
      const data = [{ name: 'John', age: 30, balance: 1000.5 }];
      const csv = convertToCSV(data);

      expect(csv).toBe('name,age,balance\nJohn,30,1000.5');
    });

    it('handles boolean values', () => {
      const data = [{ name: 'John', active: true, admin: false }];
      const csv = convertToCSV(data);

      expect(csv).toBe('name,active,admin\nJohn,true,false');
    });

    it('uses custom headers when provided', () => {
      const data = [
        { firstName: 'John', lastName: 'Doe', age: 30 },
        { firstName: 'Jane', lastName: 'Smith', age: 25 },
      ];

      const headers = [
        { key: 'firstName' as keyof typeof data[0], label: 'First Name' },
        { key: 'lastName' as keyof typeof data[0], label: 'Last Name' },
        { key: 'age' as keyof typeof data[0], label: 'Age' },
      ];

      const csv = convertToCSV(data, headers);

      expect(csv).toBe(
        'First Name,Last Name,Age\nJohn,Doe,30\nJane,Smith,25'
      );
    });

    it('handles custom headers with subset of fields', () => {
      const data = [
        { firstName: 'John', lastName: 'Doe', age: 30, email: 'john@example.com' },
      ];

      const headers = [
        { key: 'firstName' as keyof typeof data[0], label: 'Name' },
        { key: 'email' as keyof typeof data[0], label: 'Email' },
      ];

      const csv = convertToCSV(data, headers);

      expect(csv).toBe('Name,Email\nJohn,john@example.com');
    });

    it('handles multiple rows with mixed data types', () => {
      const data = [
        { name: 'John', count: 5, active: true, note: null },
        { name: 'Jane', count: 0, active: false, note: 'Test, note' },
      ];

      const csv = convertToCSV(data);

      expect(csv).toContain('John,5,true,');
      expect(csv).toContain('Jane,0,false,"Test, note"');
    });

    it('handles edge case of field with only commas', () => {
      const data = [{ value: ',,,,' }];
      const csv = convertToCSV(data);

      expect(csv).toBe('value\n",,,,"');
    });

    it('handles complex nested quotes', () => {
      const data = [{ quote: 'She said, "He said, ""Hi!"""' }];
      const csv = convertToCSV(data);

      expect(csv).toContain('"She said, ""He said, """"Hi!"""""');
    });
  });

  describe('downloadCSV', () => {
    let createElementSpy: ReturnType<typeof vi.spyOn>;
    // let appendChildSpy: ReturnType<typeof vi.spyOn>;
    let removeChildSpy: ReturnType<typeof vi.spyOn>;
    let clickSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      // Mock URL.createObjectURL and revokeObjectURL (not available in Node)
      global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
      global.URL.revokeObjectURL = vi.fn();

      // Create mock link element
      const mockLink = {
        setAttribute: vi.fn(),
        click: vi.fn(),
        style: {},
      } as unknown as HTMLAnchorElement;

      clickSpy = mockLink.click as ReturnType<typeof vi.fn>;

      // Spy on DOM methods
      createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('creates a download link with correct filename', () => {
      const csvContent = 'name,age\nJohn,30';
      const filename = 'users-export';

      downloadCSV(csvContent, filename);

      const mockLink = createElementSpy.mock.results[0].value as HTMLAnchorElement;
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'users-export.csv');
    });

    it('triggers download by clicking link', () => {
      const csvContent = 'name,age\nJohn,30';
      const filename = 'test';

      downloadCSV(csvContent, filename);

      expect(clickSpy).toHaveBeenCalledOnce();
    });

    it('cleans up DOM and object URL', () => {
      const csvContent = 'name,age\nJohn,30';
      const filename = 'test';

      downloadCSV(csvContent, filename);

      expect(removeChildSpy).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('handles special characters in filename', () => {
      const csvContent = 'data';
      const filename = 'test-file_2024';

      downloadCSV(csvContent, filename);

      const mockLink = createElementSpy.mock.results[0].value as HTMLAnchorElement;
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-file_2024.csv');
    });
  });

  describe('formatDateForCSV', () => {
    it('formats valid date string to YYYY-MM-DD', () => {
      const date = '2024-11-16T10:30:00Z';
      const formatted = formatDateForCSV(date);

      expect(formatted).toBe('2024-11-16');
    });

    it('handles null value', () => {
      const formatted = formatDateForCSV(null);
      expect(formatted).toBe('');
    });

    it('handles undefined value', () => {
      const formatted = formatDateForCSV(undefined);
      expect(formatted).toBe('');
    });

    it('handles invalid date string', () => {
      const formatted = formatDateForCSV('invalid-date');
      expect(formatted).toBe('');
    });

    it('handles ISO date without time', () => {
      const date = '2024-11-16';
      const formatted = formatDateForCSV(date);

      expect(formatted).toBe('2024-11-16');
    });

    it('handles different date formats', () => {
      const date = 'November 16, 2024';
      const formatted = formatDateForCSV(date);

      expect(formatted).toBe('2024-11-16');
    });

    it('handles ISO date string', () => {
      const formatted = formatDateForCSV('2024-11-16');

      expect(formatted).toBe('2024-11-16');
    });
  });

  describe('formatDateTimeForCSV', () => {
    it('formats valid datetime to YYYY-MM-DD HH:MM:SS', () => {
      const date = '2024-11-16T10:30:45Z';
      const formatted = formatDateTimeForCSV(date);

      expect(formatted).toMatch(/2024-11-16 \d{2}:30:45/);
    });

    it('handles null value', () => {
      const formatted = formatDateTimeForCSV(null);
      expect(formatted).toBe('');
    });

    it('handles undefined value', () => {
      const formatted = formatDateTimeForCSV(undefined);
      expect(formatted).toBe('');
    });

    it('handles invalid date string', () => {
      const formatted = formatDateTimeForCSV('not-a-date');
      expect(formatted).toBe('');
    });

    it('includes time component', () => {
      const date = '2024-11-16T14:25:33Z';
      const formatted = formatDateTimeForCSV(date);

      expect(formatted).toContain(':25:33');
    });

    it('handles midnight time', () => {
      const date = '2024-11-16T00:00:00Z';
      const formatted = formatDateTimeForCSV(date);

      expect(formatted).toMatch(/2024-11-16 \d{2}:00:00/);
    });
  });

  describe('Integration: CSV Export Flow', () => {
    it('handles complete user export workflow', () => {
      const users = [
        {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Owner',
          status: 'Active',
          joinDate: '2024-01-15T08:00:00Z',
          loginCount: 42,
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'Rider',
          status: 'Inactive',
          joinDate: '2024-03-20T12:30:00Z',
          loginCount: 5,
        },
      ];

      const csvData = users.map((user) => ({
        Name: user.name,
        Email: user.email,
        Role: user.role,
        Status: user.status,
        'Join Date': formatDateForCSV(user.joinDate),
        'Login Count': user.loginCount,
      }));

      const csv = convertToCSV(csvData);

      expect(csv).toContain('Name,Email,Role,Status,Join Date,Login Count');
      expect(csv).toContain('John Doe,john@example.com,Owner,Active,2024-01-15,42');
      expect(csv).toContain('Jane Smith,jane@example.com,Rider,Inactive,2024-03-20,5');
    });

    it('handles export with special characters and nulls', () => {
      const data = [
        {
          name: 'O\'Brien, Patrick',
          note: 'Said "Hello"',
          phone: null,
          active: true,
        },
      ];

      const csv = convertToCSV(data);

      expect(csv).toContain('"O\'Brien, Patrick"');
      expect(csv).toContain('"Said ""Hello"""');
      expect(csv).toContain(',true');
    });
  });
});
