import { z } from "zod";

export const sessionSchema = z.object({
	username: z
		.string({
			required_error: "Username is required",
			invalid_type_error: "Username must be a string",
		})
		.min(2, { message: "Username length can be minimum 2" })
		.max(32, { message: "Username length size can be maximum 32" }),
});
