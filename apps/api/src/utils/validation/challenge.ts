import { z } from "zod";

export const monthRangeSchema = z
	.object({
		month: z.coerce
			.number({
				required_error: "Month is required",
				invalid_type_error: "Month must be a number",
			})
			.min(0, { message: "Month can be minimum 0" })
			.max(11, {
				message: "Month can be maximum 11",
			}),
		year: z.coerce
			.number({
				required_error: "Year is required",
				invalid_type_error: "Year must be a number",
			})
			.min(2000, { message: "Year can be 0" })
			.max(2099, {
				message: "Year can be maximum 99",
			}),
	})
	.optional();
