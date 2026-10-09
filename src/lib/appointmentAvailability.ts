/**
 * Appointment Availability & Scheduling Utilities
 *
 * Implements slot generation, day-of-week mapping, and double-booking
 * detection using the hospital's local timezone (Asia/Kolkata).
 */

export interface GeneratedSlot {
  time: string; // "09:00"
  endTime: string; // "09:30"
  isAvailable: boolean;
}

/**
 * Returns today's date formatted as YYYY-MM-DD in Asia/Kolkata timezone.
 */
export function getTodayIST(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Derives day of week ("Monday", "Tuesday", etc.) deterministically from YYYY-MM-DD.
 */
export function getDayOfWeekFromDate(dateStr: string): string {
  const parts = dateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD.`);
  }
  const [year, month, day] = parts;
  const d = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return dayNames[d.getUTCDay()];
}

/**
 * Generates discrete time intervals from start_time to end_time using slotDuration.
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDurationMinutes: number = 30
): { time: string; endTime: string }[] {
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startTotal = startH * 60 + (startM || 0);
  const endTotal = endH * 60 + (endM || 0);

  const duration = Math.max(5, slotDurationMinutes);
  const slots: { time: string; endTime: string }[] = [];
  let current = startTotal;

  while (current + duration <= endTotal) {
    const slotStartH = Math.floor(current / 60);
    const slotStartM = current % 60;
    const slotEndH = Math.floor((current + duration) / 60);
    const slotEndM = (current + duration) % 60;

    slots.push({
      time: `${String(slotStartH).padStart(2, "0")}:${String(slotStartM).padStart(2, "0")}`,
      endTime: `${String(slotEndH).padStart(2, "0")}:${String(slotEndM).padStart(2, "0")}`,
    });

    current += duration;
  }

  return slots;
}

/**
 * Normalizes time string to standard "HH:mm".
 */
export function normalizeTime(timeStr: string): string {
  if (!timeStr) return "";
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return timeStr;
  const h = String(parseInt(parts[0], 10)).padStart(2, "0");
  const m = String(parseInt(parts[1], 10)).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Checks if a date string is strictly in the past relative to today in IST.
 */
export function isDateInPast(dateStr: string): boolean {
  const today = getTodayIST();
  return dateStr < today;
}
