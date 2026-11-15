# Requirements: Sprint B

**Product:** FIU students post what they did and learned at a club event, and other students comment on
those posts.

**Sprint goal:** a student can open a club event, write an experience post, and comment on other
students' posts, all from the app.

The "Test" column points to the automated tests in [test-report.md](test-report.md).

---

## US-1: View an event's posts (#1141)

> **As an** FIU student, **I want to** open a club event and read what other students did and learned
> there, **so that** I can decide whether the club's events are worth going to.

| # | Acceptance criterion | Test |
| --- | --- | --- |
| 1.1 | Clicking an event's title on the events list opens its page at `/events/:id`. | Manual |
| 1.2 | The home page lists events from the last 30 days under "Went to an event? Share your experience", each linking to its event page. | Manual |
| 1.3 | The event page shows the title, club, category, date and time, location, campus and description. | #11 |
| 1.4 | The page lists every experience post for the event, newest first, with the author's name, date, "What I did" and "What I learned". | #13 |
| 1.5 | Each post shows its comments in time order (oldest first). | #13, #21 |
| 1.6 | If there are no posts, the page says "No posts yet. Be the first to share what you learned!" | Manual |
| 1.7 | An unknown event id shows "This event doesn't exist." (the API returns 404). | #12, #14 |

## US-2: Post an experience (#1139, #1140)

> **As an** FIU student who went to a club event, **I want to** share what I did and what I learned,
> **so that** other students can benefit from my experience.

| # | Acceptance criterion | Test |
| --- | --- | --- |
| 2.1 | The event page has a "Share your experience" form with three fields: *Your name*, *What did you do?* and *What did you learn?* | Manual |
| 2.2 | All three fields are required. Submitting with any of them empty shows "… is required" under that field and nothing is saved. | #17 |
| 2.3 | *What did you do?* and *What did you learn?* must be 10–2000 characters, and the name at most 60. A live counter shows the length of each text field. | #18 |
| 2.4 | Leading and trailing spaces are removed before saving, and whitespace alone counts as empty. | #16, #17 |
| 2.5 | After a successful post, the new post appears at the top of the list, the two text fields clear and "Thanks! Your post is up." is shown. | #15 |
| 2.6 | If the server rejects the post, its error messages appear under the matching fields. | #17, #18 |
| 2.7 | Posting to an event that doesn't exist returns 404 "Event not found". | #20 |
| 2.8 | Posts are stored in the database, linked to their event (`ExperiencePost.eventId`). | Data model |

## US-3: Comment on a post (#1196)

> **As an** FIU student, **I want to** comment on another student's experience post, **so that** I
> can ask questions or add to what they shared.

| # | Acceptance criterion | Test |
| --- | --- | --- |
| 3.1 | Each post has a comment box with *Your name* and *Write a comment…* fields and a **Comment** button. | Manual |
| 3.2 | Both fields are required. A blank comment shows "Comment is required" and nothing is saved. | #24 |
| 3.3 | A comment is 1–1000 characters, and the name at most 60. | #24 |
| 3.4 | After submitting, the comment appears at the bottom of that post's comments and the comment field clears. | #23 |
| 3.5 | Commenting on a post that doesn't exist returns 404 "Post not found". | #25 |
| 3.6 | Comments are stored in the database, linked to their post (`Comment.postId`). Deleting a post deletes its comments. | Data model |

---

## Supporting cards

| Card | Requirement |
| --- | --- |
| #1137 Data model | `ExperiencePost` and `Comment` tables with relations to `Event` (see [data-model.md](data-model.md)). |
| #1192 Supabase/Prisma | Data is stored in Supabase PostgreSQL through Prisma. The connection string comes from `DATABASE_URL` in `server/.env`, which is never committed. |
| #1193 Seed | Realistic FIU sample data: categories, majors, clubs, upcoming and past events, and sample posts and comments. Re-running the seed creates no duplicates. |

## Out of scope this sprint

- Login. Posts store the author's name, and `authorId` is reserved for later.
- Editing, deleting or moderating posts and comments.
- Blocking posts on events that haven't happened yet.
