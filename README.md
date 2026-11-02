# PawSchedule

All FIU student club events in one place. Students can browse upcoming events
and filter them by club category (Academic, Cultural, Greek Life, …), by their
major, by campus, or by keyword.

## Tech stack

| Part   | Stack                                                                 |
| ------ | --------------------------------------------------------------------- |
| Client | React, Vite, TypeScript, Tailwind CSS, TanStack Query                 |
| Server | Node, Express, TypeScript (run with `tsx`), Zod                       |
| Data   | In-memory seed data + `server/data/events.json` (Prisma + PostgreSQL in Sprint B) |
| Tests  | Vitest + Supertest                                                    |

The repo is an npm workspaces monorepo with two packages: `client/` and `server/`.

## Getting Started

Requirements: Node.js 20 or newer.

```bash
npm install        # installs both workspaces
npm run dev        # API on http://localhost:3000, web app on http://localhost:5173
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the API.

Other commands (run from the repo root):

| Command         | What it does                                          |
| --------------- | ----------------------------------------------------- |
| `npm run build` | Type-checks and builds the server (`server/dist`) and client (`client/dist`) |
| `npm test`      | Runs the server API tests                             |
| `npm start`     | Runs the built API server                             |

Set `API_PORT` to run the API on a different port; the Vite proxy uses the same
variable. (We use `API_PORT` rather than `PORT` because dev tools often set `PORT`
for the web app.)

### Data

Seed data lives in `server/src/data/seed.ts`: 12 categories, 16 majors, 24 clubs
and 25 events. Seed events are generated relative to today on every server start,
so the page is never empty. Events added through the app are saved to
`server/data/events.json` (gitignored). Delete that file to reset to the seed data.

All data access goes through `server/src/repository/eventRepository.ts`, so the
storage can be swapped for Prisma without touching the routes.

## API

| Method | Path              | Notes |
| ------ | ----------------- | ----- |
| GET    | `/api/health`     | `{ "status": "ok" }` |
| GET    | `/api/events`     | Upcoming events (start ≥ now), sorted by start, with `clubName` and `category`. Query: `category` (comma-separated ids), `major`, `club`, `campus`, `q`, `from`, `to` (ISO dates) |
| POST   | `/api/events`     | Body: `title`, `clubId`, `start`, `end`, `location`, `campus`, optional `description` and `perks[]`. Returns `201` with the event or `400` with `fieldErrors` |
| GET    | `/api/categories` | All categories |
| GET    | `/api/majors`     | All majors |
| GET    | `/api/clubs`      | Query: `category`, `major` |

The major filter matches clubs linked to that major. Clubs that are open to every
major (most cultural, Greek and sports clubs) are not tied to a major, so they
only show when no major is selected.

## Project structure

```
client/
  src/api/          typed fetch wrapper, TanStack Query hooks, shared types
  src/components/   Header, FilterBar, EventList, EventCard, AddEventModal
  src/hooks/        useUrlFilters (filters live in the URL query string)
  src/lib/          date grouping and formatting
server/
  src/app.ts        Express app (routes + error handling)
  src/routes/       events and reference-data routes
  src/repository/   data access layer
  src/data/seed.ts  seed data
  src/validation.ts Zod schemas
  test/             API tests
```
