import db from "db";
import { sessions } from "db/schema";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { authSession } from "middlewares/session";
import { nanoid } from "nanoid";
import { setTokenCookie } from "utils/misc/session";
import { sessionSchema } from "utils/validation/session";

const r = Router();

r.get("/me", authSession, async (req, res) => {
  const user = req.session;
  return res.status(200).json(user);
});

r.get("/check-username", async (req, res) => {
  const username = sessionSchema.shape.username.parse(req.query["username"]);
  const [result] = await db
    .select({ username: sessions.username, created_at: sessions.createdAt })
    .from(sessions)
    .where(eq(sessions.username, username))
    .limit(1);

  return res.status(200).json({ available: result == null });
});

r.post("/", async (req, res) => {
  const { username } = sessionSchema.parse(req.body);
  const token = nanoid(32);
  const [session] = await db
    .insert(sessions)
    .values({ token, username })
    .returning();
  setTokenCookie(res, token);
  return res.status(201).json(session);
});

export default r;
