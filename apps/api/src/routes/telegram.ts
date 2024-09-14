import { eq, InferSelectModel, sql } from "drizzle-orm";
import { Hono } from "hono";
import { gameList, player } from "../db/schemas";
import TelegramService from "../services/telegram";
import { getPlayersFromTransfermarkt } from "../services/transfermarkt";
import { CustomEnvironment } from "../types";
import { TelegramBody } from "../types/telegram";

const telegramRouter = new Hono<CustomEnvironment>();

telegramRouter.post("/", async (c) => {
	if (
		c.req.header("X-Telegram-Bot-Api-Secret-Token") !==
		c.env.TELEGRAM_SECRET_TOKEN
	) {
		return c.status(500);
	}
	const { message } = (await c.req.json()) as TelegramBody;
	if (
		message.from?.id !== Number(c.env.TELEGRAM_CHAT_ID) ||
		message.chat.id !== Number(c.env.TELEGRAM_CHAT_ID)
	)
		return c.status(500);
	const reply = message.reply_to_message?.text;
	if (!reply) return c.status(500);
	const parsedReply: InferSelectModel<typeof gameList> = JSON.parse(reply);
	if (!parsedReply.playerIDs) return c.status(500);
	const db = c.get("db");
	const t = new TelegramService(c.env.TELEGRAM_BOT_TOKEN);
	const list = await db.query.gameList.findFirst({
		where: eq(gameList.id, parsedReply.id),
	});
	if (!list) {
		await t.sendMessage(c.env.TELEGRAM_CHAT_ID, "List not found");
		return c.status(500);
	}
	await t.sendMessage(
		c.env.TELEGRAM_CHAT_ID,
		`Starting to work on ${parsedReply.id} with ${
			parsedReply.playerIDs.split(",").length
		} players`
	);
	const data = await getPlayersFromTransfermarkt(
		parsedReply.playerIDs.split(","),
		c.env.R2_STORAGE
	).catch(async (err) => {
		await t.sendMessage(
			c.env.TELEGRAM_CHAT_ID,
			`Failed working on ${parsedReply.id}`
		);
		throw err;
	});
	await db.transaction(async (trx) => {
		await trx
			.insert(player)
			.values(
				data.map((player) => ({
					id: player.id.toString(),
					data: player,
				}))
			)
			.onConflictDoUpdate({
				target: player.id,
				set: { data: sql`excluded.data`, createdAt: sql`(unixepoch())` },
			});
		await trx
			.update(gameList)
			.set({ approvedAt: sql`(unixepoch())` })
			.where(eq(gameList.id, parsedReply.id));
	});
	await t.sendMessage(
		c.env.TELEGRAM_CHAT_ID,
		`Done working on ${parsedReply.id} with ${data.length} players`
	);
	return c.status(200);
});

export default telegramRouter;
