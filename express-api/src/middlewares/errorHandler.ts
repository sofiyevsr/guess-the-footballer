import { ErrorRequestHandler } from "express";
import { runInDevSync } from "utils/misc/runInDev";
import { ZodError } from "zod";

const errorHandler: ErrorRequestHandler = (error, _, res, __) => {
  if (error instanceof CustomError) {
    runInDevSync(() => {
      console.log("DEV: %s, %d\n %s", error.message, error.status, error.stack);
    });
    return res.status(error.status).json({ error: error.message });
  }
  else if(error instanceof ZodError){
    return res.status(400).json({ error: error.issues[0]?.message ?? "Invalid input" });
  }
  return res.status(500).json({ error: "Unexpected error" });
};

export default errorHandler;
