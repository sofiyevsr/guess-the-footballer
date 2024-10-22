import { z } from "zod";

const gameListSchema = z.object({
  name: z
    .string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
    })
    .min(4, { message: "Name can have minimum 4 characters" })
    .max(32, { message: "Name can have maximum 32 characters" }),
  description: z
    .string({
      required_error: "Description is required",
      invalid_type_error: "Description must be a string",
    })
    .min(24, { message: "Description can have minimum 24 characters" })
    .max(256, { message: "Description can have maximum 256 characters" }),
  imageKey: z
    .string({
      required_error: "Image is required",
      invalid_type_error: "Image must be a string",
    })
    .min(1, { message: "Image is required" }),
  playerIds: z
    .string({
      required_error: "Player ids array is required",
      invalid_type_error: "Player ids must be an array",
    })
    .array()
    .min(4, {
      message: "Player ids array should have at least 4 item",
    })
    .max(1000, {
      message: "Player ids array can have maximum 1000 items",
    }),
});

export default gameListSchema;
