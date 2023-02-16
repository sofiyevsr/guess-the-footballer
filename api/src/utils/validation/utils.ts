import { z } from "zod";

export const cursorValidator = z.coerce
	.number({
		invalid_type_error: "Cursor must be a number",
	})
	.optional();

export const roomIdValidator = z
	.string({
		required_error: "Room ID is required",
		invalid_type_error: "Room ID must be a string",
	})
	.max(128, { message: "Room ID can have maximum 128 characters" });
