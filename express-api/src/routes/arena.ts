import { Router } from "express";
import { defaultPaginationLimit } from "../utils/constants";
import { roomSchema } from "../utils/validation/room";
import { cursorValidator } from "../utils/validation/utils";
import { authSession } from "middlewares/session";
import { rooms } from "db/schema/room";
import db from "db";
import { DifficultyType } from "utils/types";
import { SQL, and, desc, eq, isNull, lt } from "drizzle-orm";

const r = Router();

r.get("/rooms", async (req, res) => {
  const cursor = cursorValidator.parse(req.query["cursor"]);
  const where: SQL[] = [
    eq(rooms.private, false),
    lt(rooms.current_size, rooms.size),
    isNull(rooms.started_at),
  ];
  if (cursor != null && cursor > 0) {
    where.push(lt(rooms.id, cursor));
  }
  const results = await db
    .select()
    .from(rooms)
    .where(and(...where))
    .limit(defaultPaginationLimit + 1)
    .orderBy(desc(rooms.id));
  const response: { rooms: typeof results; cursor?: number } = {
    rooms: results,
  };
  if (results.length === defaultPaginationLimit + 1) {
    response.rooms = response.rooms.slice(0, -1);
    response.cursor = response.rooms[response.rooms.length - 1].id;
  }
  return res.status(200).json(response);
});

r.get("/my-rooms", authSession, async (req, res) => {
  const cursor = cursorValidator.parse(req.query["cursor"]);
  const where: SQL[] = [];
  if (cursor != null && cursor > 0) {
    where.push(lt(rooms.id, cursor));
  }
  const results = await db
    .select()
    .from(rooms)
    .where(and(eq(rooms.creator_username, req.session!.username), ...where))
    .limit(defaultPaginationLimit + 1)
    .orderBy(desc(rooms.id));
  const response: { rooms: typeof results; cursor?: number } = {
    rooms: results,
  };
  if (results.length === defaultPaginationLimit + 1) {
    response.rooms = response.rooms.slice(0, -1);
    response.cursor = response.rooms[response.rooms.length - 1].id;
  }
  return res.status(200).json(response);
});

r.post("/rooms", authSession, async (req, res) => {
  const { size, private: nonPublic, difficulty } = roomSchema.parse(req.body);
  const [room] = await db.insert(rooms).values({
    size,
    private: nonPublic,
    difficulty: difficulty as DifficultyType,
    current_size: 0,
    creator_username: req.session!.username,
  });
  return res.status(201).json({ room });
});

export default r;
