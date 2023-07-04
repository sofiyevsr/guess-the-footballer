import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import errorHandler from "middlewares/errorHandler";
import { arenaRouter, healthRouter, playerRouter, sessionRouter } from "routes";

const app = express();

app.use(express.json({ limit: "30kb" }));
app.set("trust proxy", "loopback");
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.ORIGIN }));
app.use(helmet());

app.use("/health", healthRouter);
app.use("/session", sessionRouter);
app.use("/player", playerRouter);
app.use("/arena", arenaRouter);
app.use(errorHandler);

export default app;
