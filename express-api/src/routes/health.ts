import { Router } from "express";

const r = Router();

r.get("/", (_, res) => {
  return res.status(200).json({ status: "ready" });
});

r.get("/seed/date", (_, res) => {
  const filename = process.env.PLAYERS_FILENAME;
  if (filename == null) return res.status(404).send();
  const timestamp = filename.replace(/\D/g, "");
  const date = Number(timestamp);
  if (Number.isNaN(date)) {
    return res.status(404).send();
  }
  return res.status(200).json({ date });
});

export default r;
