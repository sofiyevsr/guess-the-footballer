import { eq } from "drizzle-orm";
import { RequestHandler } from "express";
import db from "db";
import { sessions } from "db/schema";
import { CustomError } from "utils/misc/customError";

export const authSession: RequestHandler = async (req, _, next) => {
  const token = req.cookies["token"];
  if (token == null) {
    throw new CustomError("Session token not found", 401);
  }
  const session = await getSession(token);
  if (session == null) {
    throw new CustomError("Session not found", 401);
  }
  req.session = session;
  return next();
};

export const getSession = async (token: string) => {
  const [session] = await db
    .select({ username: sessions.username, created_at: sessions.created_at })
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);
  return session as typeof session | undefined;
};
