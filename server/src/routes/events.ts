import { Router } from "express";
import type { Repository } from "../repository/eventRepository.js";
import { createEventSchema, createPostSchema, eventQuerySchema, fieldErrors } from "../validation.js";

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

  router.get("/:id", async (req, res) => {
    const event = await repo.getEvent(req.params.id);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(event);
  });

  router.get("/:id/posts", async (req, res) => {
    if (!(await repo.getEvent(req.params.id))) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    res.json(await repo.listPosts(req.params.id));
  });

  router.post("/:id/posts", async (req, res) => {
    if (!(await repo.getEvent(req.params.id))) {
      res.status(404).json({ error: "Event not found" });
      return;
    }
    const parsed = createPostSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", fieldErrors: fieldErrors(parsed.error) });
      return;
    }
    res.status(201).json(await repo.createPost(req.params.id, parsed.data));
  });

  return router;
}
