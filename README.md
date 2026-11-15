# PawSchedule

All FIU student club events in one place. Students can browse upcoming events
and filter them by club category (Academic, Cultural, Greek Life, …), by their
major, by campus, or by keyword.

## Documentation

| Document | What's in it |
| --- | --- |
| [Project plan and feasibility](docs/project-plan.md) | Problem, scope of Sprints A and B, how we work, feasibility, risks |
| [Requirements](docs/requirements.md) | User stories with acceptance criteria, each linked to its test |
| [Architecture](docs/architecture.md) | Components, endpoints, screens and the main request flow |
| [Data model](docs/data-model.md) | ER diagram, tables and rules |
| [Test report](docs/test-report.md) | 25 automated API tests (all passing), manual checks, gaps |
| [Walkthrough](docs/walkthrough.md) | Step-by-step tour of the main path, with how to run it |

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

Without a `server/.env` the API runs on in-memory seed data, which is enough to
try everything. To use the team's Supabase database, see
[Running with Supabase](#running-with-supabase) below.

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

Seed data is defined in `server/src/data/seed.ts`: 12 categories, 16 majors, 24 clubs and 29 events generated relative to the
seed time (four of them in the past, with sample experience posts and comments). Run `npm run db:seed -w server` to populate or refresh the seed records without duplicating existing data or 
affecting user-created events.

All data access goes through `server/src/repository/eventRepository.ts` (`createPrismaRepository` in production, 
`createJsonRepository` in-memory for API tests and when `DATABASE_URL` isn't set), so routes never touch storage directly.

### Running with Supabase

1. Copy `server/.env.example` to `server/.env` and set `DATABASE_URL` to the
   Supabase connection string (Project Settings → Database → Connection string,
   **Session pooler**). `server/.env` is gitignored, so never commit it.
2. Create the tables and load the sample data:
   ```bash
   npm run db:migrate -w server   # applies server/prisma/migrations
   npm run db:seed -w server      # clubs, events, sample posts and comments (safe to re-run)
   ```
3. `npm run dev`. The API logs `using PostgreSQL (Prisma)` when it is
   connected to the database.

## Experience posts and comments (Sprint B)

Open any event (click its title, or pick one under **"Went to an event? Share
your experience"** on the home page) to go to `/events/:id`. The page shows:

- the event details
- a **Share your experience** form (name, what you did, what you learned; both
  text fields are required, 10–2000 characters)
- every student post, newest first, with its comments and a comment box
  (1–1000 characters)

The four past seed events (for example "Intro to React Workshop") come with
sample posts and comments. The data model lives in
`server/prisma/schema.prisma`: `Event` → `ExperiencePost` → `Comment`, and
deleting a parent deletes its children. There's no login yet: posts store the
author's name, and `authorId` is reserved for when there is.

`npm test` runs the API tests for these endpoints in `server/test/posts.test.ts`
against the in-memory store, so no database is needed.

## API

| Method | Path              | Notes |
| ------ | ----------------- | ----- |
| GET    | `/api/health`     | `{ "status": "ok" }` |
| GET    | `/api/events`     | Upcoming events (start ≥ now), sorted by start, with `clubName` and `category`. Query: `category` (comma-separated ids), `major`, `club`, `campus`, `q`, `from`, `to` (ISO dates) |
| POST   | `/api/events`     | Body: `title`, `clubId`, `start`, `end`, `location`, `campus`, optional `description` and `perks[]`. Returns `201` with the event or `400` with `fieldErrors` |
| GET    | `/api/events/:id` | One event with `clubName` and `category`, or `404` |
| GET    | `/api/events/:id/posts` | Experience posts for the event, newest first, each with `comments[]` (oldest first). `404` if the event doesn't exist |
| POST   | `/api/events/:id/posts` | Body: `authorName` (≤60), `whatIDid`, `whatILearned` (10–2000 each). `201` with the post, `400` with `fieldErrors`, `404` for an unknown event |
| GET    | `/api/posts/:id/comments` | Comments on a post, oldest first. `404` if the post doesn't exist |
| POST   | `/api/posts/:id/comments` | Body: `authorName` (≤60), `body` (1–1000). `201` with the comment, `400` with `fieldErrors`, `404` for an unknown post |
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
  src/pages/          EventPage (posts, share form, comments)
  src/hooks/          useUrlFilters (filters live in the URL query string)
  src/lib/            date grouping and formatting
server/
  prisma/             Prisma schema and database migrations
  src/app.ts          Express app (routes + error handling)
  src/routes/         events, posts/comments and reference-data routes
  src/repository/     data access layer (Prisma + PostgreSQL)
  src/data/seed.ts    seed data and database seeder
  src/generated/      auto-generated Prisma Client (gitignored)
  src/validation.ts   Zod schemas
  test/               API tests
```
