import type { EventWithClub } from "../api/types";
import { timeRange } from "../lib/dates";
import { ClockIcon, PinIcon } from "./icons";

const categoryColors: Record<string, string> = {
  academic: "bg-sky-100 text-sky-800",
  cultural: "bg-orange-100 text-orange-800",
  "greek-life": "bg-indigo-100 text-indigo-800",
  "honor-society": "bg-amber-100 text-amber-800",
  professional: "bg-slate-200 text-slate-800",
  technology: "bg-cyan-100 text-cyan-800",
  service: "bg-emerald-100 text-emerald-800",
  religious: "bg-violet-100 text-violet-800",
  sports: "bg-lime-100 text-lime-800",
  arts: "bg-pink-100 text-pink-800",
  advocacy: "bg-red-100 text-red-800",
  wellness: "bg-teal-100 text-teal-800",
};

export function EventCard({ event }: { event: EventWithClub }) {
  return (
    <article className="rounded-xl border border-slate-200 border-l-4 border-l-gold bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-navy sm:text-lg">{event.title}</h3>
          <p className="text-sm text-slate-600">{event.clubName}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            categoryColors[event.category.id] ?? "bg-slate-100 text-slate-700"
          }`}
        >
          {event.category.name}
        </span>
      </div>

      <dl className="mt-3 grid gap-1.5 text-sm text-slate-700 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <dt className="sr-only">Time</dt>
          <ClockIcon className="h-4 w-4 shrink-0 text-gold" />
          <dd>{timeRange(event.start, event.end)}</dd>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <dt className="sr-only">Location</dt>
          <PinIcon className="h-4 w-4 shrink-0 text-gold" />
          <dd className="truncate">
            {event.location} <span className="text-slate-500">· {event.campus}</span>
          </dd>
        </div>
      </dl>

      {event.description && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{event.description}</p>}

      {event.perks.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Perks">
          {event.perks.map((perk) => (
            <li key={perk} className="rounded-md bg-gold/15 px-2 py-0.5 text-xs font-medium text-[#7a5a1d]">
              {perk}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
