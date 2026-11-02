import { useEvents } from "./api/queries";
import { EmptyState, ErrorState, EventList, EventListSkeleton } from "./components/EventList";
import { FilterBar } from "./components/FilterBar";
import { Header } from "./components/Header";
import { useUrlFilters } from "./hooks/useUrlFilters";

export default function App() {
  const { filters, setFilters, clearFilters } = useUrlFilters();
  const events = useEvents(filters);
  const hasFilters = Boolean(filters.categories.length || filters.major || filters.campus || filters.q);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAddEvent={() => {}} />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-6">
        <div>
          <h1 className="text-2xl font-bold text-navy sm:text-3xl">Upcoming Events</h1>
          <p className="text-sm text-slate-600">Every FIU club event in one place.</p>
        </div>

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
    </div>
  );
}
