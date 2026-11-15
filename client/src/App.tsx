import { useEffect, useState } from "react";
import { useEvents, useRecentPastEvents } from "./api/queries";
import type { EventWithClub } from "./api/types";
import { AddEventModal } from "./components/AddEventModal";
import { EmptyState, ErrorState, EventList, EventListSkeleton } from "./components/EventList";
import { FilterBar } from "./components/FilterBar";
import { Header } from "./components/Header";
import { useUrlFilters } from "./hooks/useUrlFilters";
import { dayLabel } from "./lib/dates";

export default function App() {
  const { filters, setFilters, clearFilters } = useUrlFilters();
  const events = useEvents(filters);
  const pastEvents = useRecentPastEvents();
  const hasFilters = Boolean(filters.categories.length || filters.major || filters.campus || filters.q);

  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleCreated = (event: EventWithClub) => {
    setAddOpen(false);
    const when = dayLabel(new Date(event.start));
    setToast(
      `"${event.title}" added for ${when === "Today" || when === "Tomorrow" ? when.toLowerCase() : when}.` +
        (hasFilters ? " Clear filters if you don't see it." : ""),
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAddEvent={() => setAddOpen(true)} />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">Upcoming Events</h1>
          <p className="text-sm text-slate-600">Every FIU club event in one place.</p>
        </div>

        {pastEvents.data && pastEvents.data.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="font-semibold text-navy">Went to an event? Share your experience</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {pastEvents.data.map((event) => (
                <li key={event.id}>
                  <a
                    href={`/events/${event.id}`}
                    className="inline-block rounded-full bg-gold/15 px-3 py-1 text-sm font-medium text-navy hover:bg-gold/30"
                  >
                    {event.title} <span className="text-slate-500">· {event.clubName}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <FilterBar filters={filters} onChange={setFilters} />

        {events.isPending ? (
          <EventListSkeleton />
        ) : events.isError ? (
          <ErrorState message={events.error.message} onRetry={() => events.refetch()} />
        ) : events.data.length === 0 ? (
          <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
        ) : (
          <div className={`space-y-4 transition-opacity ${events.isPlaceholderData ? "opacity-60" : ""}`}>
            <p className="text-sm text-slate-600" aria-live="polite">
              {events.data.length} upcoming {events.data.length === 1 ? "event" : "events"}
            </p>
            <EventList events={events.data} />
          </div>
        )}
      </main>

      <AddEventModal open={addOpen} onClose={() => setAddOpen(false)} onCreated={handleCreated} />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center px-4">
        {toast && (
          <p className="pointer-events-auto max-w-md rounded-lg bg-navy px-4 py-3 text-sm text-white shadow-lg">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}
