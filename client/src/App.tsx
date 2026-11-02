import { useEvents } from "./api/queries";

export default function App() {
  const events = useEvents({ categories: [], major: "", campus: "", q: "" });
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-navy">PawSchedule</h1>
      {events.isPending && <p>Loading…</p>}
      {events.isError && <p className="text-red-700">{events.error.message}</p>}
      <ul>{events.data?.map((event) => <li key={event.id}>{event.title}</li>)}</ul>
    </main>
  );
}
