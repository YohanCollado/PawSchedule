import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { Category, Club, EventFilters, EventWithClub, Major, NewEventPayload } from "./types";

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
