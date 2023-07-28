import { ErrorRequestHandler } from "express";
import { CustomError } from "utils/misc/customError";
import { runInDevSync } from "utils/misc/runInDev";
import { ZodError } from "zod";

const errorHandler: ErrorRequestHandler = (error, _, res, __) => {
  runInDevSync(() => {
    console.log(
      "DEV: %s, status: %d\n %s \n",
      error.message,
      error.status,
      error.stack
    );
  });
  if (error instanceof CustomError) {
    return res.status(error.status).json({ error: error.message });
  } else if (error instanceof ZodError) {
    return res
      .status(400)
      .json({ error: error.issues[0]?.message ?? "Invalid input" });
  }
  return res.status(500).json({ error: "Unexpected error" });
};

export default errorHandler;
