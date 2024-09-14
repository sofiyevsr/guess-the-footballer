import { z } from "zod";

export const roomSchema = z.object({
	listID: z
		.string({
			required_error: "List ID is required",
			invalid_type_error: "List ID must be a string",
		})
		.max(128, { message: "List ID can have maximum 128 characters" }),
	levels: z.coerce
		.number({
			required_error: "Levels is required",
			invalid_type_error: "Levels must be a number",
		})
		.min(5, { message: "Levels can be minimum 5" })
		.max(20, {
			message: "Levels can be maximum 20",
		}),
	durationBetweenLevels: z.coerce
		.number({
			required_error: "Duration between levels is required",
			invalid_type_error: "Duration between levels must be a number",
		})
		.min(15, { message: "Duration between levels can be minimum 15 seconds" })
		.max(120, {
			message: "Duration between levels can be maximum 120 seconds",
		}),
	tipRevealingInterval: z.coerce
		.number({
			required_error: "Tip revealing interval is required",
			invalid_type_error: "Tip revealing interval must be a number",
		})
		.min(2, { message: "Tip revealing interval can be minimum 2 seconds" })
		.max(20, { message: "Tip revealing interval can be maximum 20 seconds" }),
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
