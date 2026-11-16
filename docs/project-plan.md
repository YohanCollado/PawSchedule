# Project plan and feasibility

## Problem

FIU has hundreds of student clubs, and their events are spread across Instagram pages, flyers, group chats
and separate club sites. Students miss events that fit their major or interests, and once an event is over
nothing is left of it for students who are deciding whether a club is worth joining.

## Product

**PawSchedule** puts every FIU club event in one place:

1. **Find events:** browse upcoming events and filter by club category, major, campus or keyword.
2. **Add events:** club members post their own events through a validated form.
3. **Learn from past events:** students who attended write what they did and what they learned, and
   other students comment on those posts.

**Users:** FIU students looking for events, and club officers posting them.

## Scope by sprint

| Sprint | Goal | Cards | Delivered |
| --- | --- | --- | --- |
| **A** | A student can see all upcoming club events, filter them, and add a new event. | #1136 scaffold, #1137 data model + seed, #1138 events API with filters, #1139 events page with filters, #1140 add event form, #1141 connect client to API | Merged into `main` through PR #1 |
| **B** | A student can open an event, write an experience post, and comment on other students' posts. | #1137 post/comment data model, #1192 Supabase + Prisma, #1193 seed data, #1139/#1140 share-experience form, #1141 event page, #1196 comments | Branch `sprint-b-experience-posts`, PR to `main` |

Out of scope for both sprints: login and accounts, editing or moderating posts, notifications, and
importing events automatically from club pages. These are candidates for later sprints.

## How we work (development life cycle)

We follow a short iterative cycle, one per sprint:

1. **Plan:** turn the sprint goal into user stories with acceptance criteria
   ([requirements.md](requirements.md)) and split them into cards on the team Board.
2. **Design:** agree on the data model ([data-model.md](data-model.md)), API endpoints and screens
   ([architecture.md](architecture.md)) before coding.
3. **Build:** one feature branch per card or sprint. Commit messages reference the card number
   (for example `feat(server): experience post and comment endpoints (#1139, #1196)`). Database changes
   are saved as versioned Prisma migrations in `server/prisma/migrations/`.
4. **Test:** automated API tests (Vitest + Supertest) for every endpoint, plus manual checks of the UI
   ([test-report.md](test-report.md)).
5. **Review and integrate:** merge to `main` through a pull request.
6. **Review the sprint:** the Product Owner accepts each card against its acceptance criteria. What wasn't
   finished, and the gaps found in testing, go into the next sprint's plan.

## Feasibility

### Technical

| Question | Answer |
| --- | --- |
| Can we build it with skills the team has? | Yes. TypeScript on both ends, React for the UI, Express for the API: standard, well-documented tools the team has used in coursework. |
| Where does the data live? | PostgreSQL on Supabase's free tier, accessed through Prisma. A Sprint B app with hundreds of events and posts is far below the free tier's limits. |
| Can everyone run it without the database? | Yes. Without `DATABASE_URL` the API uses in-memory seed data, so any team member (or grader) can run `npm install` and `npm run dev` with no setup. The automated tests also use this mode. |
| Can we change storage later? | Routes only talk to a `Repository` interface, so storage can change without touching the API or UI. We already did this once: Sprint A used in-memory data and Sprint B moved to PostgreSQL. |

### Economic

Everything is free: open-source libraries, GitHub for code and pull requests, and Supabase's free tier for
the database. There is no hosting cost while the app runs locally for development and demos.

### Schedule

Each sprint goal was sized to a thin vertical slice (database → API → UI → tests), so each sprint ends
with something a student can use end to end rather than half-built layers.

## Risks

| Risk | Likelihood | Impact | What we do about it |
| --- | --- | --- | --- |
| No login, so anyone can post under any name | High | Medium | Accepted for now. `ExperiencePost.authorId` is reserved for linking posts to accounts when login is added. |
| Spam or inappropriate posts | Medium | Medium | Length limits and required fields now. Moderation is planned for a later sprint. |
| Database credentials leak | Low | High | `DATABASE_URL` lives only in `server/.env`, which is gitignored. `.env.example` has no secrets. |
| Supabase outage or free-tier limits during a demo | Low | Medium | The app falls back to in-memory seed data when no database is configured. |
| Prisma code path not covered by automated tests | Medium | Medium | The same interface is tested through the in-memory repository. Adding Prisma tests against a test database is a next step (see [test-report.md](test-report.md)). |
| Team members' schedules | Medium | Medium | Small cards with clear acceptance criteria, so work can be picked up by whoever is free. |
