import { z } from "zod";
import { CAMPUSES } from "./types.js";

const isoDate = z.iso.datetime({ offset: true, message: "Must be a valid date and time" });

/** Accepts `?category=a,b` as well as repeated `?category=a&category=b`. */
const csvList = z
  .union([z.string(), z.array(z.string())])
  .transform((value) =>
    (Array.isArray(value) ? value : [value])
      .flatMap((item) => item.split(","))
      .map((item) => item.trim())
      .filter(Boolean),
  );

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const eventQuerySchema = z.object({
  category: csvList.optional(),
  major: optionalString,
  club: optionalString,
  campus: z.enum(CAMPUSES).optional(),
  q: optionalString,
  from: isoDate.optional(),
  to: isoDate.optional(),
});

export const clubQuerySchema = z.object({
  category: optionalString,
  major: optionalString,
});

/** Parses to a normalized UTC ISO string so stored dates sort correctly. */
const isoDateUtc = z
  .string({ error: "Must be a valid date and time" })
  .pipe(isoDate)
  .transform((value) => new Date(value).toISOString());

const eventDates = z.object({ start: isoDateUtc, end: isoDateUtc });

export const createEventSchema = z
  .object({
    title: z.string({ error: "Title is required" }).trim().min(1, "Title is required").max(120, "Title is too long"),
    description: z.string().trim().max(2000, "Description is too long").default(""),
    clubId: z.string({ error: "Club is required" }).trim().min(1, "Club is required"),
    start: isoDateUtc.refine((value) => new Date(value).getTime() > Date.now(), "Start must be in the future"),
    end: isoDateUtc,
    location: z.string({ error: "Location is required" }).trim().min(1, "Location is required").max(200),
    campus: z.enum(CAMPUSES, { error: "Choose a campus" }),
    perks: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
  })
  .refine((data) => new Date(data.end) > new Date(data.start), {
    path: ["end"],
    message: "End must be after start",
    // Run even when unrelated fields (title, location...) are invalid.
    when: (payload) => eventDates.safeParse(payload.value).success,
  });

export type CreateEventInput = z.infer<typeof createEventSchema>;

export function fieldErrors(error: z.ZodError) {
  return z.flattenError(error).fieldErrors as Record<string, string[]>;
}
