import { PawIcon, PlusIcon } from "./icons";

export function Header({ onAddEvent }: { onAddEvent?: () => void }) {
  return (
    <header className="bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <a href="/" className="flex items-center gap-2">
          <PawIcon className="h-8 w-8 text-gold" />
          <span className="text-xl font-bold tracking-tight sm:text-2xl">
            Paw<span className="text-gold-light">Schedule</span>
          </span>
        </a>
        {onAddEvent && (
        <button
          type="button"
          onClick={onAddEvent}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-navy shadow-sm transition hover:bg-gold-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-light sm:px-4"
        >
          <PlusIcon className="h-4 w-4" />
          Add event
        </button>
        )}
      </div>
    </header>
  );
}
