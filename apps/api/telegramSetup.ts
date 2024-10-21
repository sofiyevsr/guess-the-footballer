import dotenv from "dotenv";
import TelegramService from "./src/services/telegram";

dotenv.config({ path: "./.dev.vars" });

const t = new TelegramService(process.env.TELEGRAM_BOT_TOKEN as string);
const response = await t.setWebhook(
	process.env.TELEGRAM_WEBHOOK_URL as string,
	process.env.TELEGRAM_SECRET_TOKEN as string
);
console.log(response);
const webhookInfo = await t.getWebhookInfo();
console.log(webhookInfo);
