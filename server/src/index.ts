import "dotenv/config";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createJsonRepository, createPrismaRepository } from "./repository/eventRepository.js";

// API_PORT rather than PORT: tooling often sets PORT for the client dev server.
const PORT = Number(process.env.API_PORT ?? 3000);
const DATA_FILE =
  process.env.EVENTS_FILE ?? fileURLToPath(new URL("../data/events.json", import.meta.url));

// Supabase/PostgreSQL when DATABASE_URL is set (server/.env); otherwise in-memory seed data.
const repo = process.env.DATABASE_URL
  ? createPrismaRepository(process.env.DATABASE_URL)
  : createJsonRepository({ filePath: DATA_FILE });
const app = createApp(repo);

app.listen(PORT, () => {
  const storage = process.env.DATABASE_URL ? "PostgreSQL (Prisma)" : "in-memory seed data";
  console.log(`PawSchedule API listening on http://localhost:${PORT} using ${storage}`);
});
