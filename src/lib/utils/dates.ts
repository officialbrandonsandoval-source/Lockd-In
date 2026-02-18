// =============================================================================
// Date Utility Functions for Lockd In
// =============================================================================

import {
  format,
  isToday as fnsIsToday,
  isYesterday as fnsIsYesterday,
  startOfWeek,
  endOfWeek,
  getDay,
  differenceInDays,
  parseISO,
} from "date-fns";

// ---------------------------------------------------------------------------
// Format helpers
// ---------------------------------------------------------------------------

/**
 * Format a date into a readable string.
 * Default format: "MMM d, yyyy" (e.g. "Jan 15, 2026")
 */
export function formatDate(
  date: Date | string,
  formatStr: string = "MMM d, yyyy"
): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format a time string (HH:mm) into a readable format.
 * Converts "06:00" to "6:00 AM".
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return format(date, "h:mm a");
}

// ---------------------------------------------------------------------------
// Week utilities
// ---------------------------------------------------------------------------

/**
 * Get the start and end dates of the week containing the given date.
 * Week starts on Monday.
 */
export function getWeekRange(date: Date | string): { start: Date; end: Date } {
  const d = typeof date === "string" ? parseISO(date) : date;
  return {
    start: startOfWeek(d, { weekStartsOn: 1 }),
    end: endOfWeek(d, { weekStartsOn: 1 }),
  };
}

/**
 * Get the start of the week (Monday) for the given date.
 */
export function getStartOfWeek(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return startOfWeek(d, { weekStartsOn: 1 });
}

/**
 * Get the end of the week (Sunday) for the given date.
 */
export function getEndOfWeek(date: Date | string): Date {
  const d = typeof date === "string" ? parseISO(date) : date;
  return endOfWeek(d, { weekStartsOn: 1 });
}

// ---------------------------------------------------------------------------
// Day utilities
// ---------------------------------------------------------------------------

/**
 * Get the day of the week as a string (e.g. "Monday").
 */
export function getDayOfWeek(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE");
}

/**
 * Get the numeric day of the week (0 = Sunday, 6 = Saturday).
 */
export function getDayOfWeekNumber(date: Date | string): number {
  const d = typeof date === "string" ? parseISO(date) : date;
  return getDay(d);
}

// ---------------------------------------------------------------------------
// Relative date checks
// ---------------------------------------------------------------------------

/**
 * Check if a date is today.
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return fnsIsToday(d);
}

/**
 * Check if a date is yesterday.
 */
export function isYesterday(date: Date | string): boolean {
  const d = typeof date === "string" ? parseISO(date) : date;
  return fnsIsYesterday(d);
}

/**
 * Format a date relative to today.
 * Returns "Today", "Yesterday", or the formatted date.
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;

  if (fnsIsToday(d)) return "Today";
  if (fnsIsYesterday(d)) return "Yesterday";

  const daysDiff = differenceInDays(new Date(), d);

  if (daysDiff > 0 && daysDiff < 7) {
    return format(d, "EEEE"); // "Monday", "Tuesday", etc.
  }

  return format(d, "MMM d, yyyy");
}

// ---------------------------------------------------------------------------
// ISO helpers
// ---------------------------------------------------------------------------

/**
 * Get today's date as an ISO date string (YYYY-MM-DD).
 */
export function getTodayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Parse an ISO date string into a Date object.
 */
export function parseDate(dateStr: string): Date {
  return parseISO(dateStr);
}
