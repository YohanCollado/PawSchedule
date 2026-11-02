import express from "express";

const PORT = Number(process.env.PORT ?? 3000);

const app = express();
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`PawSchedule API listening on http://localhost:${PORT}`);
});
