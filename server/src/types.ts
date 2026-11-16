export const CAMPUSES = ["MMC", "BBC", "Engineering Center", "Online"] as const;
export type Campus = (typeof CAMPUSES)[number];

export interface Category {
  id: string;
  name: string;
}

export interface Major {
  id: string;
  name: string;
}

export interface Club {
  id: string;
  name: string;
  categoryId: string;
  /** Majors this club is most relevant to. Empty means it is not tied to a major. */
  majorIds: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  clubId: string;
  /** ISO 8601 timestamps (UTC). */
  start: string;
  end: string;
  location: string;
  campus: Campus;
  perks: string[];
  source: "manual";
  createdAt: string;
}

/** Event as returned by the API: joined with its club and category. */
export interface EventWithClub extends Event {
  clubName: string;
  category: Category;
}

export type NewEvent = Omit<Event, "id" | "source" | "createdAt">;

export interface EventFilter {
  categoryIds?: string[];
  majorId?: string;
  clubId?: string;
  campus?: Campus;
  q?: string;
  from: Date;
  to?: Date;
}

export interface ClubFilter {
  categoryId?: string;
  majorId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

/** A student's write-up of a club event: what they did and what they learned. */
export interface ExperiencePost {
  id: string;
  eventId: string;
  authorName: string;
  whatIDid: string;
  whatILearned: string;
  createdAt: string;
}

export interface PostWithComments extends ExperiencePost {
  comments: Comment[];
}

export type NewPost = Pick<ExperiencePost, "authorName" | "whatIDid" | "whatILearned">;
export type NewComment = Pick<Comment, "authorName" | "body">;
