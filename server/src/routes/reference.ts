import { Router } from "express";
import type { Repository } from "../repository/eventRepository.js";
import { clubQuerySchema, fieldErrors } from "../validation.js";

/** Read-only lookup data: categories, majors and clubs. */
export function referenceRouter(repo: Repository) {
  const router = Router();

  router.get("/categories", async (_req, res) => {
    res.json(await repo.listCategories());
  });

  router.get("/majors", async (_req, res) => {
    res.json(await repo.listMajors());
  });

  router.get("/clubs", async (req, res) => {
    const parsed = clubQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query", fieldErrors: fieldErrors(parsed.error) });
      return;
    }
    res.json(await repo.listClubs({ categoryId: parsed.data.category, majorId: parsed.data.major }));
  });

  return router;
}
