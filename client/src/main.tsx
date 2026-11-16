import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { EventPage } from "./pages/EventPage";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

// Tiny path-based routing: /events/:id shows the event page, everything else the list.
const eventMatch = window.location.pathname.match(/^\/events\/([^/]+)\/?$/);
const eventId = eventMatch ? decodeURIComponent(eventMatch[1]) : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {eventId ? <EventPage eventId={eventId} /> : <App />}
    </QueryClientProvider>
  </StrictMode>,
);
