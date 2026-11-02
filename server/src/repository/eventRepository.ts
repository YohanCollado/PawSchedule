import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { buildSeedEvents, categories, clubs, majors, SEED_ID_PREFIX } from "../data/seed.js";
import type {
  Category,
  Club,
  ClubFilter,
  Event,
  EventFilter,
  EventWithClub,
  Major,
  NewEvent,
} from "../types.js";

/**
 * All data access goes through this interface so routes never touch storage
 * directly. Sprint B swaps the JSON implementation for Prisma + PostgreSQL.
 */
export interface Repository {
  listEvents(filter: EventFilter): Promise<EventWithClub[]>;
  createEvent(input: NewEvent): Promise<EventWithClub>;
  listCategories(): Promise<Category[]>;
  listMajors(): Promise<Major[]>;
  listClubs(filter?: ClubFilter): Promise<Club[]>;
  getClub(id: string): Promise<Club | undefined>;
}

export interface JsonRepositoryOptions {
  /** Where user-created events are persisted. `null` keeps everything in memory (tests). */
  filePath: string | null;
  now?: Date;
}

/**
 * In-memory repository. Reference data (categories, majors, clubs) and seed
 * events come from the seed file and are rebuilt relative to the current date
 * on every start; only user-created events are written to `filePath`.
 */
export function createJsonRepository({ filePath, now = new Date() }: JsonRepositoryOptions): Repository {
  const events: Event[] = [...buildSeedEvents(now), ...loadUserEvents(filePath)];
  const clubsById = new Map(clubs.map((club) => [club.id, club]));
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  function withClub(event: Event): EventWithClub {
    const club = clubsById.get(event.clubId)!;
    return { ...event, clubName: club.name, category: categoriesById.get(club.categoryId)! };
  }

  function persist() {
    if (!filePath) return;
    mkdirSync(dirname(filePath), { recursive: true });
    const userEvents = events.filter((event) => !event.id.startsWith(SEED_ID_PREFIX));
    writeFileSync(filePath, JSON.stringify(userEvents, null, 2));
  }

  return {
    async listEvents(filter) {
      const q = filter.q?.trim().toLowerCase();
      return events
        .filter((event) => {
          const start = new Date(event.start);
          if (start < filter.from) return false;
          if (filter.to && start > filter.to) return false;
          if (filter.clubId && event.clubId !== filter.clubId) return false;
          if (filter.campus && event.campus !== filter.campus) return false;

          const club = clubsById.get(event.clubId);
          if (!club) return false;
          if (filter.categoryIds?.length && !filter.categoryIds.includes(club.categoryId)) return false;
          if (filter.majorId && !club.majorIds.includes(filter.majorId)) return false;

          if (q) {
            const haystack = [event.title, event.description, event.location, club.name]
              .join(" ")
              .toLowerCase();
            if (!haystack.includes(q)) return false;
          }
          return true;
        })
        .sort((a, b) => a.start.localeCompare(b.start))
        .map(withClub);
    },

    async createEvent(input) {
      const event: Event = {
        ...input,
        id: randomUUID(),
        source: "manual",
        createdAt: new Date().toISOString(),
      };
      events.push(event);
      persist();
      return withClub(event);
    },

    async listCategories() {
      return categories;
    },

    async listMajors() {
      return majors;
    },

    async listClubs(filter = {}) {
      return clubs
        .filter((club) => !filter.categoryId || club.categoryId === filter.categoryId)
        .filter((club) => !filter.majorId || club.majorIds.includes(filter.majorId))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    async getClub(id) {
      return clubsById.get(id);
    },
  };
}

function loadUserEvents(filePath: string | null): Event[] {
  if (!filePath || !existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn(`Could not read ${filePath}, starting with seed data only.`, error);
    return [];
  }
}
