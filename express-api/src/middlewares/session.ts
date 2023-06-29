import { eq } from "drizzle-orm";
import { RequestHandler } from "express";
import db from "db";
import { sessions } from "db/schema";

export const authSession: RequestHandler = async (req, _, next) => {
  const token = req.cookies["token"];
  if (token == null) {
    throw new CustomError("Session token not found", 401);
  }
  const [session] = await db
    .select({ username: sessions.username, createdAt: sessions.createdAt })
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (session == null) {
    throw new CustomError("Session not found", 401);
  }
  req.session = session;
  return next();
};
