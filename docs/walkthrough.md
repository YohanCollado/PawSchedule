# System walkthrough

This follows the main path a student takes through PawSchedule, from finding an event to commenting on
another student's experience post. Each step names the acceptance criteria it shows
([requirements.md](requirements.md)) and the code behind it.

## Run it

Requirements: Node.js 20 or newer.

```bash
git clone https://github.com/YohanCollado/PawSchedule.git
cd PawSchedule
git checkout sprint-b-experience-posts   # until the Sprint B PR is merged into main
npm install
npm run dev
```

Open http://localhost:5173. No database is needed: without `server/.env` the API uses the built-in seed
data (24 clubs, 29 events, sample posts and comments).

## Sprint A: find and add events

**1. Browse upcoming events.** The home page, **Upcoming Events**, lists every club event from now on, grouped
by day (*Today*, *Tomorrow*, then by date). Each card shows the title, club, category, time, location,
campus and perks.
*Code:* `client/src/components/EventList.tsx`, `EventCard.tsx` → `GET /api/events`.

**2. Filter.** Click a category chip (for example *Technology*), choose a major under **My major**, choose a
campus, or type in **Search** (try `arepa`). The list updates right away, and the filters are saved in the
URL, so a filtered view can be bookmarked or shared. **Clear filters** resets them. If nothing matches,
the page says *No events match* and suggests fewer filters.
*Code:* `FilterBar.tsx`, `hooks/useUrlFilters.ts` → `GET /api/events?category=…&major=…&campus=…&q=…`.

**3. Add an event.** Click **Add event**. Submit the empty form: each field shows its own error (*Title is
required*, *Location is required*, …). A start time in the past shows *Start must be in the future*, and an
end before the start shows *End must be after start*. Fill it in correctly and save: the new event appears
in the list.
*Code:* `AddEventModal.tsx` → `POST /api/events`, validated by Zod in `server/src/validation.ts`.

## Sprint B: share and discuss experiences

**4. Open a past event.** Scroll to **Went to an event? Share your experience** on the home page and pick
**Intro to React Workshop**, or click any event's title. The event page (`/events/:id`) shows its details
and every experience post, newest first. *(US-1: 1.1–1.5)*
*Code:* `client/src/pages/EventPage.tsx` → `GET /api/events/:id` and `GET /api/events/:id/posts`.

**5. Read posts and comments.** Each post shows the author, date, **What I did** and **What I learned**,
with its comments below, oldest first. *(US-1: 1.4, 1.5)*

**6. Try an invalid post.** In **Share your experience**, leave the fields empty, or type fewer than 10
characters, and click **Post**. Each field shows its own error and nothing is saved. The counters show how
many characters each field has. *(US-2: 2.2–2.4, 2.6)*

**7. Write a post.** Fill in *Your name*, *What you did* and *What you learned* (10+ characters each) and
click **Post**. The post appears at the top of the list, the text fields clear and the page says *Thanks!
Your post is up.* *(US-2: 2.5)*
*Code:* `POST /api/events/:id/posts` → `server/src/routes/posts.ts` → repository.

**8. Comment.** Under any post, enter your name and a comment in **Write a comment…** and click
**Comment**. It appears at the bottom of that post's comments. A blank comment is rejected with *Comment is
required*. *(US-3: 3.1–3.4)*
*Code:* `POST /api/posts/:id/comments`.

**9. Unknown event.** Go to http://localhost:5173/events/does-not-exist. The page says *This event doesn't
exist.* *(US-1: 1.7)*

**10. Run the tests.** Stop the dev server and run `npm test`: 25 tests, all passing
([test-report.md](test-report.md)).

## With the team database

To run against Supabase PostgreSQL instead of in-memory data, follow
[Running with Supabase](../README.md#running-with-supabase) in the README. The API then logs
`using PostgreSQL (Prisma)`, and posts and comments are saved in the `ExperiencePost` and `Comment` tables
([data-model.md](data-model.md)).
