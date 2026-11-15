# Test report

**Result: 25 of 25 tests passed (0 failed).**

| | |
| --- | --- |
| Date run | 2026-11-15 |
| Branch | `sprint-b-experience-posts` |
| Command | `npm test` (Vitest 4.1.12 + Supertest, Node 24.13.0, Windows 11) |
| Test files | `server/test/events.test.ts` (Sprint A), `server/test/posts.test.ts` (Sprint B) |
| Duration | about 0.7 s |

The tests start the real Express app and send real HTTP requests to it with Supertest. They run against
the in-memory repository with the seed data, so each test starts from the same known data and no
database is needed. The Prisma repository implements the same interface but isn't covered by automated
tests yet (see [Not covered](#not-covered)).

To reproduce: `npm install`, then `npm test` from the repo root. For per-test output, run
`npx vitest run --reporter=verbose` in `server/`.

## Sprint A: events and reference data (`events.test.ts`)

| # | Endpoint | Test case | What it checks | Result |
| --- | --- | --- | --- | --- |
| 1 | GET /api/health | reports ok | Returns 200 with `{ status: "ok" }` | ✅ Pass |
| 2 | GET /api/events | lists upcoming seed events sorted by start, with club and category | More than 20 events, sorted by start time, none in the past, each with `clubName` and `category` | ✅ Pass |
| 3 | GET /api/events | filters by category (comma-separated list) | `?category=technology,cultural` returns only events from those two categories | ✅ Pass |
| 4 | GET /api/events | filters by major | `?major=nursing` returns only events from clubs linked to Nursing | ✅ Pass |
| 5 | GET /api/events | filters by keyword search | `?q=arepa` returns exactly "Arepa Night" | ✅ Pass |
| 6 | GET /api/events | rejects an unknown campus | `?campus=Mars` returns 400 with a `campus` field error | ✅ Pass |
| 7 | POST /api/events | creates a valid event and returns it in the list | Returns 201 with the club name and category, and the event appears in a later search | ✅ Pass |
| 8 | POST /api/events | returns 400 with field errors for an invalid event | Blank title, missing club and location, start in the past, end before start: one message per field | ✅ Pass |
| 9 | POST /api/events | returns 400 when the club does not exist | An unknown `clubId` returns "Club not found" | ✅ Pass |
| 10 | GET /api/clubs | filters clubs by category and major | Technology + Information Technology returns exactly ACM, INIT and WiCS | ✅ Pass |

## Sprint B: experience posts and comments (`posts.test.ts`)

| # | Endpoint | Test case | What it checks | Result |
| --- | --- | --- | --- | --- |
| 11 | GET /api/events/:id | returns a single event with its club | The seed event "Intro to React Workshop" comes back with club "ACM at FIU" | ✅ Pass |
| 12 | GET /api/events/:id | returns 404 for an unknown event | 404 `{ error: "Event not found" }` | ✅ Pass |
| 13 | GET /api/events/:id/posts | lists posts newest first, each with comments oldest first | 2 seed posts in newest-first order; the comments on post 1 are in time order | ✅ Pass |
| 14 | GET /api/events/:id/posts | returns 404 for an unknown event | 404 | ✅ Pass |
| 15 | POST /api/events/:id/posts | creates a post and returns it in the list | Returns 201 with the saved fields and an empty `comments` list, and the post is first in the list | ✅ Pass |
| 16 | POST /api/events/:id/posts | trims whitespace | `"  Test Student  "` is saved as `"Test Student"` | ✅ Pass |
| 17 | POST /api/events/:id/posts | returns 400 when fields are missing | A blank name and missing text fields give one "is required" message per field | ✅ Pass |
| 18 | POST /api/events/:id/posts | returns 400 when text is too short or too long | 5 characters gives "at least 10", and 2001 characters gives "at most 2000" | ✅ Pass |
| 19 | POST /api/events/:id/posts | returns 400 for invalid JSON | A malformed request body returns 400, not a server error | ✅ Pass |
| 20 | POST /api/events/:id/posts | returns 404 for an unknown event | 404 `{ error: "Event not found" }` | ✅ Pass |
| 21 | GET /api/posts/:id/comments | lists comments oldest first | 2 seed comments, oldest first | ✅ Pass |
| 22 | GET /api/posts/:id/comments | returns 404 for an unknown post | 404 `{ error: "Post not found" }` | ✅ Pass |
| 23 | POST /api/posts/:id/comments | adds a comment that shows up under the post | Returns 201, and the comment is the last one under its post on the event's posts list | ✅ Pass |
| 24 | POST /api/posts/:id/comments | returns 400 for an empty or too-long comment | A blank comment gives "Comment is required", and 1001 characters gives "at most 1000" | ✅ Pass |
| 25 | POST /api/posts/:id/comments | returns 404 for an unknown post | 404 | ✅ Pass |

## Totals

| File | Tests | Passed | Failed |
| --- | --- | --- | --- |
| events.test.ts | 10 | 10 | 0 |
| posts.test.ts | 15 | 15 | 0 |
| **Total** | **25** | **25** | **0** |

## Manual checks

Done on 2026-11-15 with `npm run dev`, without a database (in-memory data):

- Through the Vite proxy, `GET /api/events/seed-26/posts` returned the seed posts with their comments.
- `/events/seed-26` loaded, and the client compiled without errors.
- Posting with a blank name returned one clear message per field.
- `npm run build` type-checked and built both the client and the server.

## Not covered

- **Supabase/Prisma:** the new migration and seed haven't been run against the team database yet, and
  there are no automated tests for the Prisma repository.
- **Frontend:** there are no automated UI tests. The event page and forms were checked manually.
