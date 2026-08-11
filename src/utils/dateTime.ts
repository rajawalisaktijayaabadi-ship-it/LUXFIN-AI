import { APP_CONFIG } from '../config/appConfig';

/**
 * Timezone-aware date/time helper for Asia/Jakarta (WIB)
 */

export function getCurrentDateWIB(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_CONFIG.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // YYYY-MM-DD
}

export function getCurrentDateTimeWIB(): string {
  const now = new Date();
  return now.toISOString();
}

export function formatDateWIB(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: APP_CONFIG.timezone,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatDateTimeWIB(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: APP_CONFIG.timezone,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function isDateInMonthWIB(dateStr: string, yearMonth: string): boolean {
  if (!dateStr || !yearMonth) return false;
  return dateStr.startsWith(yearMonth);
}

export function getCurrentMonthYearWIB(): string {
  return getCurrentDateWIB().substring(0, 7); // YYYY-MM
}
