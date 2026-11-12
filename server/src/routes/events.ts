import { Router } from "express";
import type { Repository } from "../repository/eventRepository.js";
import { createEventSchema, eventQuerySchema, fieldErrors } from "../validation.js";

export function eventsRouter(repo: Repository) {
  const router = Router();

  router.get("/", async (req, res) => {
    const parsed = eventQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query", fieldErrors: fieldErrors(parsed.error) });
      return;
    }
    const { category, major, club, campus, q, from, to } = parsed.data;
    const events = await repo.listEvents({
      categoryIds: category,
      majorId: major,
      clubId: club,
      campus,
      q,
      from: from ? new Date(from) : new Date(),
      to: to ? new Date(to) : undefined,
    });
    res.json(events);
  });

  router.post("/", async (req, res) => {
    const parsed = createEventSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", fieldErrors: fieldErrors(parsed.error) });
      return;
    }
    if (!(await repo.getClub(parsed.data.clubId))) {
      res.status(400).json({ error: "Validation failed", fieldErrors: { clubId: ["Club not found"] } });
      return;
    }
    const event = await repo.createEvent(parsed.data);
    res.status(201).json(event);
  });

  return router;
}
