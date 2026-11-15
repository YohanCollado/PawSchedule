import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { createJsonRepository } from "../src/repository/eventRepository.js";

// seed-26 is the past "Intro to React Workshop", which has two seed posts.
const EVENT_ID = "seed-26";
const POST_ID = "seed-post-1";

const validPost = () => ({
  authorName: "Test Student",
  whatIDid: "Went to the workshop and built a small app.",
  whatILearned: "How React state and effects work together.",
});

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp(createJsonRepository({ filePath: null }));
});

describe("GET /api/events/:id", () => {
  it("returns a single event with its club", async () => {
    const res = await request(app).get(`/api/events/${EVENT_ID}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ id: EVENT_ID, title: "Intro to React Workshop", clubName: "ACM at FIU" });
  });

  it("returns 404 for an unknown event", async () => {
    const res = await request(app).get("/api/events/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Event not found" });
  });
});

describe("GET /api/events/:id/posts", () => {
  it("lists posts newest first, each with comments oldest first", async () => {
    const res = await request(app).get(`/api/events/${EVENT_ID}/posts`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);

    const created = res.body.map((post: { createdAt: string }) => post.createdAt);
    expect(created).toEqual([...created].sort().reverse());

    const withComments = res.body.find((post: { id: string }) => post.id === POST_ID);
    expect(withComments.comments.map((c: { authorName: string }) => c.authorName)).toEqual(["Marcus T.", "Ana P."]);
  });

  it("returns 404 for an unknown event", async () => {
    const res = await request(app).get("/api/events/nope/posts");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/events/:id/posts", () => {
  it("creates a post and returns it in the list", async () => {
    const res = await request(app).post(`/api/events/${EVENT_ID}/posts`).send(validPost());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(String), eventId: EVENT_ID, ...validPost(), comments: [] });

    const list = await request(app).get(`/api/events/${EVENT_ID}/posts`);
    expect(list.body[0].id).toBe(res.body.id);
  });

  it("trims whitespace", async () => {
    const res = await request(app)
      .post(`/api/events/${EVENT_ID}/posts`)
      .send({ ...validPost(), authorName: "  Test Student  " });
    expect(res.status).toBe(201);
    expect(res.body.authorName).toBe("Test Student");
  });

  it("returns 400 when fields are missing", async () => {
    const res = await request(app).post(`/api/events/${EVENT_ID}/posts`).send({ authorName: "   " });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors).toEqual({
      authorName: ["Your name is required"],
      whatIDid: ["What you did is required"],
      whatILearned: ["What you learned is required"],
    });
  });

  it("returns 400 when text is too short or too long", async () => {
    const res = await request(app)
      .post(`/api/events/${EVENT_ID}/posts`)
      .send({ ...validPost(), whatIDid: "short", whatILearned: "x".repeat(2001) });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors).toEqual({
      whatIDid: ["What you did must be at least 10 characters"],
      whatILearned: ["What you learned must be at most 2000 characters"],
    });
  });

  it("returns 400 for invalid JSON", async () => {
    const res = await request(app)
      .post(`/api/events/${EVENT_ID}/posts`)
      .set("Content-Type", "application/json")
      .send("{not json");
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown event", async () => {
    const res = await request(app).post("/api/events/nope/posts").send(validPost());
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Event not found" });
  });
});

describe("GET /api/posts/:id/comments", () => {
  it("lists comments oldest first", async () => {
    const res = await request(app).get(`/api/posts/${POST_ID}/comments`);
    expect(res.status).toBe(200);
    expect(res.body.map((c: { body: string }) => c.body)).toHaveLength(2);
    expect(res.body[0].authorName).toBe("Marcus T.");
  });

  it("returns 404 for an unknown post", async () => {
    const res = await request(app).get("/api/posts/nope/comments");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Post not found" });
  });
});

describe("POST /api/posts/:id/comments", () => {
  it("adds a comment that shows up under the post", async () => {
    const res = await request(app)
      .post(`/api/posts/${POST_ID}/comments`)
      .send({ authorName: "Test Student", body: "Great write-up!" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(String), postId: POST_ID, body: "Great write-up!" });

    const posts = await request(app).get(`/api/events/${EVENT_ID}/posts`);
    const post = posts.body.find((p: { id: string }) => p.id === POST_ID);
    expect(post.comments.at(-1).id).toBe(res.body.id);
  });

  it("returns 400 for an empty or too-long comment", async () => {
    const empty = await request(app).post(`/api/posts/${POST_ID}/comments`).send({ authorName: "A", body: "  " });
    expect(empty.status).toBe(400);
    expect(empty.body.fieldErrors).toEqual({ body: ["Comment is required"] });

    const long = await request(app)
      .post(`/api/posts/${POST_ID}/comments`)
      .send({ authorName: "A", body: "x".repeat(1001) });
    expect(long.status).toBe(400);
    expect(long.body.fieldErrors).toEqual({ body: ["Comment must be at most 1000 characters"] });
  });

  it("returns 404 for an unknown post", async () => {
    const res = await request(app).post("/api/posts/nope/comments").send({ authorName: "A", body: "Hi" });
    expect(res.status).toBe(404);
  });
});
