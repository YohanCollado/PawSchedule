import { Router } from "express";
import type { Repository } from "../repository/eventRepository.js";
import { createCommentSchema, fieldErrors } from "../validation.js";

/** Comments on experience posts. */
export function postsRouter(repo: Repository) {
  const router = Router();

  router.get("/:id/comments", async (req, res) => {
    if (!(await repo.postExists(req.params.id))) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.json(await repo.listComments(req.params.id));
  });

  router.post("/:id/comments", async (req, res) => {
    if (!(await repo.postExists(req.params.id))) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    const parsed = createCommentSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", fieldErrors: fieldErrors(parsed.error) });
      return;
    }
    res.status(201).json(await repo.createComment(req.params.id, parsed.data));
  });

  return router;
}
