import { eq, InferSelectModel, sql } from "drizzle-orm";
import { Hono } from "hono";
import { gameList, player } from "../db/schemas";
import TelegramService from "../services/telegram";
import { getPlayersFromTransfermarkt } from "../services/transfermarkt";
import { CustomEnvironment } from "../types";
import { TelegramBody } from "../types/telegram";
import { PlayerData } from "../services/transfermarkt/_types";
import { batchInsert } from "../utils/misc/common";

const telegramRouter = new Hono<CustomEnvironment>();

telegramRouter.post("/", async (c) => {
	const t = new TelegramService(c.env.TELEGRAM_BOT_TOKEN);
	if (
		c.req.header("X-Telegram-Bot-Api-Secret-Token") !==
		c.env.TELEGRAM_SECRET_TOKEN
	) {
		await t.sendMessage(c.env.TELEGRAM_CHAT_ID, "Token doesn't match");
		return c.text("", 200);
	}
	const { message } = (await c.req.json()) as TelegramBody;

	if (Date.now() - message.date * 1000 > 10 * 1000) {
		await t.sendMessage(
			c.env.TELEGRAM_CHAT_ID,
			"Message is older than 10 seconds, skipping..."
		);
		return c.text("", 200);
	}
	if (
		message.from?.id !== Number(c.env.TELEGRAM_CHAT_ID) ||
		message.chat.id !== Number(c.env.TELEGRAM_CHAT_ID)
	) {
		await t.sendMessage(c.env.TELEGRAM_CHAT_ID, "Chat ID doesn't match");
		return c.text("", 200);
	}
	if (message.text !== "yes") {
		await t.sendMessage(
			c.env.TELEGRAM_CHAT_ID,
			`Message is not yes, ${message.text}`
		);
		return c.text("", 200);
	}
	const reply = message.reply_to_message?.text;
	if (!reply) {
		await t.sendMessage(c.env.TELEGRAM_CHAT_ID, "Reply is empty");
		return c.text("", 200);
	}
	const parsedReply: InferSelectModel<typeof gameList> = JSON.parse(reply);
	if (!parsedReply.playerIDs) {
		await t.sendMessage(c.env.TELEGRAM_CHAT_ID, "PlayerIDs is empty");
		return c.text("", 200);
	}
	const db = c.get("db");
	const list = await db.query.gameList.findFirst({
		where: eq(gameList.id, parsedReply.id),
	});
	if (!list) {
		await t.sendMessage(c.env.TELEGRAM_CHAT_ID, "List not found");
		return c.text("", 200);
	}
	await t.sendMessage(
		c.env.TELEGRAM_CHAT_ID,
		`Starting to work on ${parsedReply.id} with ${
			parsedReply.playerIDs.split(",").length
		} players`
	);
	let data: PlayerData[];
	try {
		data = await getPlayersFromTransfermarkt(parsedReply.playerIDs.split(","));
		await t.sendMessage(
			c.env.TELEGRAM_CHAT_ID,
			`Got with ${data.length} players out of ${
				parsedReply.playerIDs.split(",").length
			}`
		);
	} catch (error) {
		await t.sendMessage(
			c.env.TELEGRAM_CHAT_ID,
			`Failed working on ${parsedReply.id}, ${JSON.stringify(error)}`
		);
		return c.text("", 200);
	}
	await t.sendMessage(
		c.env.TELEGRAM_CHAT_ID,
		`Resolved with ${data.length} players out of ${
			parsedReply.playerIDs.split(",").length
		}`
	);
	try {
		await Promise.all(
			batchInsert(
				data.map((player) => ({
					id: player.id.toString(),
					data: player,
				}))
			).map((data) =>
				db
					.insert(player)
					.values(data)
					.onConflictDoUpdate({
						target: player.id,
						set: { data: sql`excluded.data`, createdAt: sql`(unixepoch())` },
					})
			)
		);
		await db
			.update(gameList)
			.set({ approvedAt: sql`(unixepoch())` })
			.where(eq(gameList.id, parsedReply.id));
	} catch (error) {
		await t.sendMessage(c.env.TELEGRAM_CHAT_ID, `error db ${error}`);
		return c.text("", 200);
	}
	await t.sendMessage(
		c.env.TELEGRAM_CHAT_ID,
		`Done working on ${parsedReply.id} with ${data.length} players`
	);
	return c.text("", 200);
});

export default telegramRouter;
