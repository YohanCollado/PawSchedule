import type { EventWithClub } from "../api/types";
import { groupByDay } from "../lib/dates";
import { EventCard } from "./EventCard";
import { PawIcon } from "./icons";

export function EventList({ events }: { events: EventWithClub[] }) {
  return (
    <div className="space-y-8">
      {groupByDay(events).map((group) => (
        <section key={group.key} aria-labelledby={`day-${group.key}`}>
          <h2
            id={`day-${group.key}`}
            className="mb-3 flex items-baseline gap-2 border-b border-slate-200 pb-1 text-lg font-bold text-navy"
          >
            {group.label}
            <span className="text-sm font-normal text-slate-500">
              {group.events.length} {group.events.length === 1 ? "event" : "events"}
            </span>
          </h2>
          <div className="grid gap-3">
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function EventListSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading events">
      {[3, 2].map((count, groupIndex) => (
        <div key={groupIndex}>
          <div className="mb-3 h-6 w-32 animate-pulse rounded bg-slate-200" />
          <div className="grid gap-3">
            {Array.from({ length: count }, (_, index) => (
              <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-slate-100" />
                <div className="mt-4 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <PawIcon className="mx-auto h-10 w-10 text-gold/60" />
      <h2 className="mt-3 text-lg font-semibold text-navy">No events match</h2>
      <p className="mt-1 text-sm text-slate-600">
        {hasFilters ? "Try fewer filters or a different search." : "No upcoming events yet. Be the first to add one!"}
      </p>
      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-light"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-red-800">Couldn't load events</h2>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
      >
        Try again
      </button>
    </div>
  );
}
