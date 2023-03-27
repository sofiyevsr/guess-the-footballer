import { z } from "zod";

export const roomSchema = z.object({
	size: z.coerce
		.number({
			required_error: "Room size is required",
			invalid_type_error: "Room size must be a number",
		})
		.min(2, { message: "Room size can be minimum 2" })
		.max(5, { message: "Room size can be maximum 5" }),
	private: z.boolean({
		required_error: "Private is required",
		invalid_type_error: "Private must be a boolean",
	}),
});
