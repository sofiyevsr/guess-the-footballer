import { z } from "zod";

export const answerSchema = z.object({
	answer: z
		.string({
			required_error: "Answer is required",
			invalid_type_error: "Answer must be a string",
		})
		.max(128, { message: "Answer can have maximum 128 characters" }),
});
