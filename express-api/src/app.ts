import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import errorHandler from "middlewares/errorHandler";
import { healthRouter, playerRouter, sessionRouter } from "routes";

const app = express();

app.use(express.json({ limit: "30kb" }));
app.set("trust proxy", "loopback");
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.ORIGIN }));
app.use(helmet());

app.use(healthRouter);
app.use(sessionRouter);
app.use(playerRouter);
app.use(errorHandler);

export default app;
