import { useEffect, useRef, useState } from "react";
import { useCategories, useMajors } from "../api/queries";
import { CAMPUSES, type EventFilters } from "../api/types";
import { SearchIcon } from "./icons";

interface FilterBarProps {
  filters: EventFilters;
  onChange: (update: Partial<EventFilters>) => void;
}

const chipBase =
  "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";
const chipOn = "border-navy bg-navy text-white";
const chipOff = "border-slate-300 bg-white text-slate-700 hover:border-navy hover:text-navy";

const selectClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-navy focus:outline-none focus:ring-2 focus:ring-gold/40";

export function FilterBar({ filters, onChange }: FilterBarProps) {
  const categories = useCategories();
  const majors = useMajors();
  const [search, setSearch] = useState(filters.q);
  const lastSentSearch = useRef(filters.q);

  // Keep the input in sync when filters change elsewhere (e.g. "Clear filters").
  useEffect(() => {
    if (filters.q === lastSentSearch.current) return;
    lastSentSearch.current = filters.q;
    setSearch(filters.q);
  }, [filters.q]);

  // Debounce typing before it hits the URL and the API.
  useEffect(() => {
    if (search === lastSentSearch.current) return;
    const timer = setTimeout(() => {
      lastSentSearch.current = search;
      onChange({ q: search });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, onChange]);

  const toggleCategory = (id: string) => {
    const selected = filters.categories.includes(id)
      ? filters.categories.filter((categoryId) => categoryId !== id)
      : [...filters.categories, id];
    onChange({ categories: selected });
  };

  return (
    <section aria-label="Filters" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
        <button
          type="button"
          aria-pressed={filters.categories.length === 0}
          onClick={() => onChange({ categories: [] })}
          className={`${chipBase} ${filters.categories.length === 0 ? chipOn : chipOff}`}
        >
          All
        </button>
        {categories.data?.map((category) => {
          const active = filters.categories.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              onClick={() => toggleCategory(category.id)}
              className={`${chipBase} ${active ? chipOn : chipOff}`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr]">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">My major</span>
          <select value={filters.major} onChange={(e) => onChange({ major: e.target.value })} className={selectClass}>
            <option value="">All majors</option>
            {majors.data?.map((major) => (
              <option key={major.id} value={major.id}>
                {major.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Campus</span>
          <select value={filters.campus} onChange={(e) => onChange({ campus: e.target.value })} className={selectClass}>
            <option value="">All campuses</option>
            {CAMPUSES.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Search</span>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Events, clubs, places…"
              className={`${selectClass} pl-9`}
            />
          </div>
        </label>
      </div>
    </section>
  );
}
