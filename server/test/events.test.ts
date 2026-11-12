import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { clubs } from "../src/data/seed.js";
import { createJsonRepository } from "../src/repository/eventRepository.js";
import type { EventWithClub } from "../src/types.js";

const HOUR = 60 * 60 * 1000;
const inHours = (hours: number) => new Date(Date.now() + hours * HOUR).toISOString();

let app: ReturnType<typeof createApp>;

beforeEach(() => {
  app = createApp(createJsonRepository({ filePath: null }));
});

describe("GET /api/health", () => {
  it("reports ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

describe("GET /api/events", () => {
  it("lists upcoming seed events sorted by start, with club and category", async () => {
    const res = await request(app).get("/api/events");
    expect(res.status).toBe(200);

    const events: EventWithClub[] = res.body;
    expect(events.length).toBeGreaterThan(20);

    const starts = events.map((event) => new Date(event.start).getTime());
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(starts.every((start) => start >= Date.now() - 1000)).toBe(true);

    expect(events[0]).toMatchObject({
      clubName: expect.any(String),
      category: { id: expect.any(String), name: expect.any(String) },
    });
  });

  it("filters by category (comma-separated list)", async () => {
    const res = await request(app).get("/api/events?category=technology,cultural");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    const categoryIds = new Set(res.body.map((event: EventWithClub) => event.category.id));
    expect([...categoryIds].sort()).toEqual(["cultural", "technology"]);
  });

  it("filters by major", async () => {
    const res = await request(app).get("/api/events?major=nursing");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    const nursingClubs = clubs.filter((club) => club.majorIds.includes("nursing")).map((club) => club.id);
    for (const event of res.body as EventWithClub[]) {
      expect(nursingClubs).toContain(event.clubId);
    }
  });

  it("filters by keyword search", async () => {
    const res = await request(app).get("/api/events?q=arepa");
    expect(res.body.map((event: EventWithClub) => event.title)).toEqual(["Arepa Night"]);
  });

  it("rejects an unknown campus", async () => {
    const res = await request(app).get("/api/events?campus=Mars");
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors.campus).toBeDefined();
  });
});

describe("POST /api/events", () => {
  const validEvent = () => ({
    title: "Capstone Demo Day",
    clubId: "acm",
    start: inHours(48),
    end: inHours(50),
    location: "PG6 Tech Station 120",
    campus: "MMC",
    description: "Teams present their projects.",
    perks: ["Free food"],
  });

  it("creates a valid event and returns it in the list", async () => {
    const res = await request(app).post("/api/events").send(validEvent());
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      title: "Capstone Demo Day",
      clubName: "ACM at FIU",
      category: { id: "technology" },
      source: "manual",
    });

    const list = await request(app).get("/api/events?q=capstone");
    expect(list.body).toHaveLength(1);
    expect(list.body[0].id).toBe(res.body.id);
  });

  it("returns 400 with field errors for an invalid event", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ title: "  ", start: inHours(-1), end: inHours(-2), campus: "MMC" });

    expect(res.status).toBe(400);
    expect(res.body.fieldErrors).toMatchObject({
      title: ["Title is required"],
      clubId: ["Club is required"],
      location: ["Location is required"],
      start: ["Start must be in the future"],
      end: ["End must be after start"],
    });
  });

  it("returns 400 when the club does not exist", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ ...validEvent(), clubId: "not-a-club" });
    expect(res.status).toBe(400);
    expect(res.body.fieldErrors).toEqual({ clubId: ["Club not found"] });
  });
});

describe("GET /api/clubs", () => {
  it("filters clubs by category and major", async () => {
    const res = await request(app).get("/api/clubs?category=technology&major=information-technology");
    expect(res.status).toBe(200);
    expect(res.body.map((club: { id: string }) => club.id).sort()).toEqual(["acm", "init", "wics"]);
  });
});
