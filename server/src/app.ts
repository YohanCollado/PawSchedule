import express, { type ErrorRequestHandler } from "express";
import type { Repository } from "./repository/eventRepository.js";
import { eventsRouter } from "./routes/events.js";
import { referenceRouter } from "./routes/reference.js";

export function createApp(repo: Repository) {
  const app = express();
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/events", eventsRouter(repo));
  app.use("/api", referenceRouter(repo));

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err?.type === "entity.parse.failed") {
      res.status(400).json({ error: "Request body must be valid JSON" });
      return;
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  };
  app.use(errorHandler);

  return app;
}
