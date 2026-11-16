// Mirrors server/src/types.ts. Keep these in sync until we share a package.

export const CAMPUSES = ["MMC", "BBC", "Engineering Center", "Online"] as const;
export type Campus = (typeof CAMPUSES)[number];

export const PERKS = ["Free food", "Free merch", "Networking", "Resume help", "Prizes", "Service hours"] as const;

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
  majorIds: string[];
}

export interface EventWithClub {
  id: string;
  title: string;
  description: string;
  clubId: string;
  clubName: string;
  category: Category;
  start: string;
  end: string;
  location: string;
  campus: Campus;
  perks: string[];
  source: "manual";
  createdAt: string;
}

export interface NewEventPayload {
  title: string;
  description: string;
  clubId: string;
  start: string;
  end: string;
  location: string;
  campus: Campus;
  perks: string[];
}

export interface EventFilters {
  categories: string[];
  major: string;
  campus: string;
  q: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface PostWithComments {
  id: string;
  eventId: string;
  authorName: string;
  whatIDid: string;
  whatILearned: string;
  createdAt: string;
  comments: Comment[];
}

export interface NewPostPayload {
  authorName: string;
  whatIDid: string;
  whatILearned: string;
}

export interface NewCommentPayload {
  authorName: string;
  body: string;
}

/** Mirrors POST_LIMITS in server/src/validation.ts. */
export const POST_LIMITS = { name: 60, textMin: 10, textMax: 2000, comment: 1000 } as const;
