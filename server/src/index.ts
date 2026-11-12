import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { createJsonRepository } from "./repository/eventRepository.js";

// API_PORT rather than PORT: tooling often sets PORT for the client dev server.
const PORT = Number(process.env.API_PORT ?? 3000);
const DATA_FILE =
  process.env.EVENTS_FILE ?? fileURLToPath(new URL("../data/events.json", import.meta.url));

const repo = createJsonRepository({ filePath: DATA_FILE });
const app = createApp(repo);

app.listen(PORT, () => {
  console.log(`PawSchedule API listening on http://localhost:${PORT}`);
});
