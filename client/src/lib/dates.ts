import type { EventWithClub } from "../api/types";

const timeFormat = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });
const dayFormat = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric" });

/** Local calendar day as "YYYY-MM-DD". */
export function toDateKey(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** "Today", "Tomorrow" or e.g. "Thursday, Nov 6". */
export function dayLabel(date: Date, now = new Date()) {
  const today = toDateKey(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  const key = toDateKey(date);
  if (key === today) return "Today";
  if (key === toDateKey(tomorrow)) return "Tomorrow";
  return dayFormat.format(date);
}

/** "6:00 – 7:30 PM", or "11:00 AM – 1:00 PM" when the period changes. */
export function timeRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const startText = timeFormat.format(start);
  const endText = timeFormat.format(end);
  const samePeriod = startText.slice(-2) === endText.slice(-2) && toDateKey(start) === toDateKey(end);
  return `${samePeriod ? startText.slice(0, -3) : startText} – ${endText}`;
}

export interface DayGroup {
  key: string;
  label: string;
  events: EventWithClub[];
}

/** Groups events (already sorted by start) by local calendar day. */
export function groupByDay(events: EventWithClub[], now = new Date()): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const event of events) {
    const start = new Date(event.start);
    const key = toDateKey(start);
    let group = groups.get(key);
    if (!group) {
      group = { key, label: dayLabel(start, now), events: [] };
      groups.set(key, group);
    }
    group.events.push(event);
  }
  return [...groups.values()];
}
