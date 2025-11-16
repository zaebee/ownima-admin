/**
 * CSV Export Utilities
 *
 * Provides functions to export tabular data to CSV format with proper escaping
 * and browser download handling.
 */

/**
 * Escapes a CSV field value
 * - Wraps in quotes if contains comma, newline, or quote
 * - Doubles internal quotes for proper escaping
 */
function escapeCsvField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts an array of objects to CSV format
 * @param data - Array of objects to export
 * @param headers - Optional custom headers (defaults to object keys)
 * @returns CSV string
 */
export function convertToCSV<T extends Record<string, unknown>>(
  data: T[],
  headers?: { key: keyof T; label: string }[]
): string {
  if (data.length === 0) {
    return '';
  }

  // If headers not provided, use keys from first object
  const csvHeaders = headers || Object.keys(data[0]).map((key) => ({ key, label: key }));

  // Build header row
  const headerRow = csvHeaders.map((h) => escapeCsvField(h.label)).join(',');

  // Build data rows
  const dataRows = data.map((row) =>
    csvHeaders.map((h) => escapeCsvField(row[h.key])).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Downloads a CSV string as a file in the browser
 * @param csvContent - The CSV content string
 * @param filename - Desired filename (without extension)
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create blob with UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL
  URL.revokeObjectURL(url);
}

/**
 * Formats a date for CSV export (YYYY-MM-DD format)
 */
export function formatDateForCSV(date: string | null | undefined): string {
  if (!date) return '';

  try {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch {
    return '';
  }
}

/**
 * Formats a datetime for CSV export (YYYY-MM-DD HH:MM:SS format)
 */
export function formatDateTimeForCSV(date: string | null | undefined): string {
  if (!date) return '';

  try {
    const d = new Date(date);
    return d.toISOString().replace('T', ' ').split('.')[0]; // YYYY-MM-DD HH:MM:SS
  } catch {
    return '';
  }
}
