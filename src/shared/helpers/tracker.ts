import { tz } from "@date-fns/tz";
import { utc, UTCDate } from "@date-fns/utc";
import {
  addDays,
  differenceInSeconds,
  eachDayOfInterval,
  format,
  isValid,
  parse,
  parseISO,
} from "date-fns";

export const NEW_EVENT_ID = "new-event";

// Internal tracker record type with consistent Date handling
export interface TrackerRecord {
  id: string;
  date: string | null;
  description: string | null;
  amount: number | null;
  user: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  } | null;
}

/**
 * Creates a safe Date using UTCDate for better UTC handling
 */
export const createSafeDate = (
  dateInput: string | Date | null | undefined,
  fallback?: Date,
): Date => {
  if (!dateInput) return fallback ?? new UTCDate();

  if (typeof dateInput === "string") {
    // Try parseISO first (handles ISO 8601 formats)
    const date = parseISO(dateInput);
    if (isValid(date)) {
      return date;
    }

    // Try UTCDate constructor as final fallback
    try {
      const utcDate = utc(dateInput);
      if (isValid(utcDate)) {
        return new Date(utcDate.getTime());
      }
    } catch (error) {
      console.warn("Date parsing failed:", error);
    }

    return fallback ?? new UTCDate();
  }

  return isValid(dateInput) ? dateInput : (fallback ?? new UTCDate());
};

/**
 * Format time from date with optional timezone support
 */
export const formatTimeFromDate = (
  date: Date | string | null,
  timezone?: string,
): string => {
  const safeDate = createSafeDate(date);

  if (timezone && timezone !== "UTC") {
    try {
      const createTZDate = tz(timezone);
      const tzDate = createTZDate(safeDate);
      return format(tzDate, "HH:mm");
    } catch (error) {
      console.warn("Timezone formatting failed:", error);
    }
  }

  return format(safeDate, "HH:mm");
};

/**
 * Parse time with midnight crossing support using timezone-aware parsing
 */
export const parseTimeWithMidnightCrossing = (
  startTime: string,
  stopTime: string,
  baseDate: Date,
  timezone?: string,
): { start: Date; stop: Date; duration: number } => {
  if (timezone && timezone !== "UTC") {
    try {
      const createTZDate = tz(timezone);

      // Create timezone-aware base date
      const tzBaseDate = createTZDate(baseDate);

      // Parse times in the timezone context
      const startDate = parse(startTime, "HH:mm", tzBaseDate);
      let stopDate = parse(stopTime, "HH:mm", tzBaseDate);

      // If stop time is before start time, assume it's on the next day
      if (stopDate < startDate) {
        stopDate = addDays(stopDate, 1);
      }

      const duration = differenceInSeconds(stopDate, startDate);

      return {
        start: new Date(startDate.getTime()),
        stop: new Date(stopDate.getTime()),
        duration,
      };
    } catch (error) {
      console.warn("Timezone time parsing failed:", error);
    }
  }

  // Fallback to UTC parsing
  const startDate = parse(startTime, "HH:mm", baseDate);
  let stopDate = parse(stopTime, "HH:mm", baseDate);

  // If stop time is before start time, assume it's on the next day
  if (stopDate < startDate) {
    stopDate = addDays(stopDate, 1);
  }

  const duration = differenceInSeconds(stopDate, startDate);

  return { start: startDate, stop: stopDate, duration };
};

/**
 * Get slot from date with timezone support (already updated)
 */
export const getSlotFromDate = (
  date: Date | string | null,
  timezone?: string,
): number => {
  const safeDate = createSafeDate(date);

  if (timezone && timezone !== "UTC") {
    try {
      // Use tz() function to create timezone-aware date
      const createTZDate = tz(timezone);
      const tzDate = createTZDate(safeDate);

      return tzDate.getHours() * 4 + Math.floor(tzDate.getMinutes() / 15);
    } catch (error) {
      console.warn("TZDate slot calculation failed:", error);
      // Fallback to browser timezone
    }
  }

  // Fallback to browser timezone (for backward compatibility)
  return safeDate.getHours() * 4 + Math.floor(safeDate.getMinutes() / 15);
};

/**
 * Calculate duration between dates with timezone support
 */
export const calculateDuration = (
  start: Date | string | null,
  stop: Date | string | null,
): number => {
  const startDate = createSafeDate(start);
  const stopDate = createSafeDate(stop);

  // If stop is before start, assume stop is on the next day
  if (stopDate < startDate) {
    const nextDayStop = addDays(stopDate, 1);
    return differenceInSeconds(nextDayStop, startDate);
  }

  return differenceInSeconds(stopDate, startDate);
};

/**
 * Format hour with timezone support
 */
export const formatHour = (hour: number, timeFormat?: number | null) => {
  // Create a simple date with the hour - no timezone conversion needed for labels
  const date = new Date(2024, 0, 1, hour, 0, 0, 0); // Use arbitrary date, just set the hour
  return format(date, timeFormat === 12 ? "hh:mm a" : "HH:mm");
};

/**
 * Create new event with timezone-aware time creation
 */
export const createNewEvent = (
  slot: number,
  selectedProjectId: string | null,
  selectedDate?: string | null,
  timezone?: string,
): TrackerRecord => {
  const baseDate = selectedDate ? parseISO(selectedDate) : new UTCDate();

  if (timezone && timezone !== "UTC") {
    try {
      const createTZDate = tz(timezone);
      const tzBaseDate = createTZDate(baseDate);

      return {
        id: NEW_EVENT_ID,
        date: format(tzBaseDate, "yyyy-MM-dd"),
        description: null,
        amount: 0,
        user: null,
      };
    } catch (error) {
      console.warn("Timezone event creation failed:", error);
    }
  }

  return {
    id: NEW_EVENT_ID,
    date: selectedDate ?? null,
    description: null,
    amount: 0, // 15 minutes in seconds
    user: null,
  };
};

export const updateEventTime = (
  event: TrackerRecord,
  date: Date,
): TrackerRecord => {
  return {
    ...event,
    date: format(date, "yyyy-MM-dd"),
  };
};

// Date range utilities
export function sortDates(dates: string[]) {
  return dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
}

export function getTrackerDates(
  range: string[] | null,
  selectedDate: string | null,
): Date[] {
  if (range) {
    return sortDates(range).map((dateString) => new Date(dateString));
  }

  if (selectedDate) {
    return [new Date(selectedDate)];
  }

  return [new Date()];
}

export const getDates = (
  selectedDate: string | null,
  sortedRange: string[] | null,
): string[] => {
  if (selectedDate) return [selectedDate];
  if (sortedRange && sortedRange.length === 2) {
    const [start, end] = sortedRange;
    if (start && end) {
      return eachDayOfInterval({
        start: parseISO(start),
        end: parseISO(end),
      }).map((date) => format(date, "yyyy-MM-dd"));
    }
  }
  return [];
};

// Validation utilities
export const isValidTimeSlot = (slot: number): boolean => {
  return slot >= 0 && slot < 96; // 24 hours * 4 slots per hour
};

export const isValidDateString = (dateStr: string): boolean => {
  return isValid(parseISO(dateStr));
};

// Form data conversion utilities
export const convertToFormData = (record: TrackerRecord) => {
  return {
    id: record.id === NEW_EVENT_ID ? undefined : record.id,
    date: record.date,
    description: record.description ?? "",
    amount: record.amount,
  };
};

export const convertFromFormData = (
  formData: {
    id?: string;
    start: string;
    stop: string;
    projectId: string;
    assignedId?: string;
    description?: string;
    duration: number;
  },
  baseDate: Date,
  dates: string[],
  timezone?: string, // Add timezone parameter
): {
  id?: string;
  start: string;
  stop: string;
  dates: string[];
  assignedId: string | null;
  projectId: string;
  description: string | null;
  duration: number;
} => {
  const {
    start: startDate,
    stop: stopDate,
    duration,
  } = parseTimeWithMidnightCrossing(
    formData.start,
    formData.stop,
    baseDate,
    timezone,
  );

  return {
    id: formData.id === NEW_EVENT_ID ? undefined : formData.id,
    start: startDate.toISOString(),
    stop: stopDate.toISOString(),
    dates,
    assignedId: formData.assignedId ?? null,
    projectId: formData.projectId,
    description: formData.description ?? null,
    duration: duration,
  };
};
