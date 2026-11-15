# Data model

The schema lives in [`server/prisma/schema.prisma`](../server/prisma/schema.prisma) and is stored in
PostgreSQL on Supabase. Migrations are in `server/prisma/migrations/`.

```mermaid
erDiagram
    Category ||--o{ Club : "groups"
    Club }o--o{ Major : "relevant to"
    Club ||--o{ Event : "hosts"
    Event ||--o{ ExperiencePost : "has"
    ExperiencePost ||--o{ Comment : "has"

    Category {
        String id PK
        String name
    }
    Major {
        String id PK
        String name
    }
    Club {
        String id PK
        String name
        String categoryId FK
    }
    Event {
        String id PK "uuid"
        String title
        String description
        String clubId FK
        String location
        String campus "MMC, BBC, Engineering Center, Online"
        DateTime start
        DateTime end
        String perks "text array"
        String source "default manual"
        DateTime createdAt
    }
    ExperiencePost {
        String id PK "uuid"
        String eventId FK
        String authorId "nullable, reserved for login"
        String authorName
        String whatIDid
        String whatILearned
        DateTime createdAt
    }
    Comment {
        String id PK "uuid"
        String postId FK
        String authorName
        String body
        DateTime createdAt
    }
```

## Tables

| Table | What it holds |
| --- | --- |
| **Category** | A type of club (Academic, Cultural, Greek Life, Technology, …), used to filter events. |
| **Major** | An FIU major. It's linked to clubs so students can filter events by their major. |
| **Club** | An FIU student organization. Each club belongs to one category and can be linked to many majors. Prisma stores the club–major link in the implicit `_ClubToMajor` table. |
| **Event** | A club event: title, date and time, location, campus and perks (free food, networking, …). |
| **ExperiencePost** | A student's write-up of an event they went to: what they did and what they learned. |
| **Comment** | A reply from another student on an experience post. |

## Rules

- Deleting an `Event` deletes its posts, and deleting a post deletes its comments (`onDelete: Cascade`).
- Posts are indexed on `(eventId, createdAt)` and comments on `(postId, createdAt)`, which matches how
  the app reads them: all posts for an event, and all comments for a post, in time order.
- There's no login yet, so posts and comments store the author's name. `ExperiencePost.authorId` is
  reserved for linking to a user account later.
- Length limits are enforced by the API (see [requirements.md](requirements.md)), not by the database.
