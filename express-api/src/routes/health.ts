import { Router } from "express";

const r = Router();

r.get("/", (_, res) => {
  return res.status(200).json("ready");
});

export default r;
