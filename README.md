# PawSchedule

All FIU student club events in one place. Students can browse upcoming events
and filter them by club category (Academic, Cultural, Greek Life, …), by their
major, by campus, or by keyword.

## Tech stack

| Part   | Stack                                                                 |
| ------ | --------------------------------------------------------------------- |
| Client | React, Vite, TypeScript, Tailwind CSS, TanStack Query                 |
| Server | Node, Express, TypeScript (run with `tsx`), Zod                       |
| Data   | Prisma + PostgreSQL                                                   |
| Tests  | Vitest + Supertest                                                    |

The repo is an npm workspaces monorepo with two packages: `client/` and `server/`.

## Getting Started

Requirements: Node.js 20 or newer.

```bash
npm install        # installs both workspaces
npm run dev        # API on http://localhost:3000, web app on http://localhost:5173
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the API.

Copy `server/.env.example` to `server/.env` and paste the team Supabase password.

Other commands (run from the repo root):

| Command                       | What it does                                          |
| ----------------------------- | ----------------------------------------------------- |
| `npm run build`               | Type-checks and builds the server (`server/dist`) and client (`client/dist`) |
| `npm run db:migrate -w server`| Applies pending Prisma schema migrations to the PostgreSQL database | 
| `npm run db:seed -w server`   | Populates the database with categories, majors, clubs, and starter events (safe to re-run) |
| `npm test`                    | Runs the server API tests                             |
| `npm start`                   | Runs the built API server                             |

Set `API_PORT` to run the API on a different port; the Vite proxy uses the same
variable. (We use `API_PORT` rather than `PORT` because dev tools often set `PORT`
for the web app.)

## Data

Data is stored in PostgreSQL (hosted on Supabase) and accessed through Prisma (`server/prisma/schema.prisma`). 
Configure the database connection by copying `server/.env.example` to `server/.env` and setting `DATABASE_URL`.

Seed data is defined in `server/src/data/seed.ts`: 12 categories, 16 majors, 24 clubs and 25 starter events generated relative 
to the seed time. Run `npm run db:seed -w server` to populate or refresh the seed records without duplicating existing data or 
affecting user-created events.

All data access goes through `server/src/repository/eventRepository.ts` (`createPrismaRepository` in production, 
`createJsonRepository` in-memory for API tests), so routes never touch storage directly.

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
  src/api/            typed fetch wrapper, TanStack Query hooks, shared types
  src/components/     Header, FilterBar, EventList, EventCard, AddEventModal
  src/hooks/          useUrlFilters (filters live in the URL query string)
  src/lib/            date grouping and formatting
server/
  prisma/             Prisma schema and database migrations
  src/app.ts          Express app (routes + error handling)
  src/routes/         events and reference-data routes
  src/repository/     data access layer (Prisma + PostgreSQL)
  src/data/seed.ts    seed data and database seeder
  src/generated/      auto-generated Prisma Client (gitignored)
  src/validation.ts   Zod schemas
  test/               API tests
```
