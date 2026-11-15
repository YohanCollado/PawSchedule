import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type {
  Category,
  Club,
  Comment,
  EventFilters,
  EventWithClub,
  Major,
  NewCommentPayload,
  NewEventPayload,
  NewPostPayload,
  PostWithComments,
} from "./types";

export function eventsSearchParams(filters: EventFilters) {
  const params = new URLSearchParams();
  if (filters.categories.length) params.set("category", filters.categories.join(","));
  if (filters.major) params.set("major", filters.major);
  if (filters.campus) params.set("campus", filters.campus);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  return params;
}

export function useEvents(filters: EventFilters) {
  const params = eventsSearchParams(filters).toString();
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => apiFetch<EventWithClub[]>(`/api/events${params ? `?${params}` : ""}`),
    placeholderData: (previous) => previous,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => apiFetch<Category[]>("/api/categories"),
    staleTime: Infinity,
  });
}

export function useMajors() {
  return useQuery({
    queryKey: ["majors"],
    queryFn: () => apiFetch<Major[]>("/api/majors"),
    staleTime: Infinity,
  });
}

export function useClubs() {
  return useQuery({
    queryKey: ["clubs"],
    queryFn: () => apiFetch<Club[]>("/api/clubs"),
    staleTime: Infinity,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewEventPayload) =>
      apiFetch<EventWithClub>("/api/events", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["events"] }),
  });
}

const DAY = 24 * 60 * 60 * 1000;

/** Events from the last 30 days, most recent first: the ones students can write about. */
export function useRecentPastEvents() {
  return useQuery({
    queryKey: ["events", "recent-past"],
    queryFn: async () => {
      const now = Date.now();
      const params = new URLSearchParams({
        from: new Date(now - 30 * DAY).toISOString(),
        to: new Date(now).toISOString(),
      });
      const events = await apiFetch<EventWithClub[]>(`/api/events?${params}`);
      return events.reverse();
    },
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["event", id],
    queryFn: () => apiFetch<EventWithClub>(`/api/events/${encodeURIComponent(id)}`),
  });
}

export function usePosts(eventId: string) {
  return useQuery({
    queryKey: ["posts", eventId],
    queryFn: () => apiFetch<PostWithComments[]>(`/api/events/${encodeURIComponent(eventId)}/posts`),
  });
}

export function useCreatePost(eventId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewPostPayload) =>
      apiFetch<PostWithComments>(`/api/events/${encodeURIComponent(eventId)}/posts`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", eventId] }),
  });
}

export function useCreateComment(eventId: string, postId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: NewCommentPayload) =>
      apiFetch<Comment>(`/api/posts/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts", eventId] }),
  });
}
