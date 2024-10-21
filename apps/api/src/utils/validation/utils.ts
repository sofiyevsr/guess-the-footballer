import { z } from "zod";

export const cursorValidator = z.object({
	cursor: z.coerce
		.number({
			invalid_type_error: "Cursor must be a number",
		})
		.optional(),
});

export const numberIdValidator = z.object({
	id: z.coerce.number({
		required_error: "ID is required",
		invalid_type_error: "ID must be a number",
	}),
});

export const idValidator = z.object({
	id: z.string({
		required_error: "ID is required",
		invalid_type_error: "ID must be a string",
	}),
});
