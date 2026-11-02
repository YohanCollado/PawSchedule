import { useCallback, useEffect, useState } from "react";
import { eventsSearchParams } from "../api/queries";
import type { EventFilters } from "../api/types";

export const EMPTY_FILTERS: EventFilters = { categories: [], major: "", campus: "", q: "" };

function readFilters(): EventFilters {
  const params = new URLSearchParams(window.location.search);
  return {
    categories: (params.get("category") ?? "").split(",").filter(Boolean),
    major: params.get("major") ?? "",
    campus: params.get("campus") ?? "",
    q: params.get("q") ?? "",
  };
}

/**
 * Filter state that lives in the URL query string, so filtered views can be
 * shared as links and survive a refresh.
 */
export function useUrlFilters() {
  const [filters, setFiltersState] = useState<EventFilters>(readFilters);

  useEffect(() => {
    const onPopState = () => setFiltersState(readFilters());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setFilters = useCallback((update: Partial<EventFilters>) => {
    setFiltersState((previous) => {
      const next = { ...previous, ...update };
      // Keep commas readable in shared links: ?category=cultural,technology
      const query = eventsSearchParams(next).toString().replace(/%2C/g, ",");
      window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => setFilters(EMPTY_FILTERS), [setFilters]);

  return { filters, setFilters, clearFilters };
}
