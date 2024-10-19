import ky from "ky";

type ChatType = "private" | "group" | "supergroup" | "channel";

interface User {
	id: number;
	is_bot: boolean;
	first_name: string;
	last_name?: string | undefined;
	username?: string | undefined;
	language_code?: string | undefined;
}

interface Chat {
	id: number;
	type: ChatType;
	title?: string | undefined;
	username?: string | undefined;
	first_name?: string | undefined;
	last_name?: string | undefined;
}

export interface TelegramMessage {
	message_id: number;
	message_thread_id?: number | undefined;
	from?: User | undefined;
	date: number;
	chat: Chat;
	reply_to_message?: Message | undefined;
	text?: string | undefined;
}

class TelegramService {
	private baseUrl: string;
	private readonly maxMessageLength = 4096;
	constructor(token: string) {
		this.baseUrl = "https://api.telegram.org/bot" + token;
	}
	async getWebhookInfo() {
		const data = await ky.get(this.baseUrl + "/getWebhookInfo").json();
		return data;
	}
	async setWebhook(url: string, secretToken: string) {
		const data = await ky
			.post(this.baseUrl + "/setWebhook", {
				searchParams: { url, secret_token: secretToken },
			})
			.json();
		return data;
	}
	async sendPhoto(chatId: string, caption: string, fileURL: string) {
		const data = await ky
			.post(this.baseUrl + "/sendPhoto", {
				json: {
					chat_id: chatId,
					photo: fileURL,
					caption,
				},
			})
			.json();
		return data;
	}
	async sendMessage(chatId: string, text: string) {
		const promises = [] as Promise<unknown>[];
		for (let len = 0; len < text.length; len += this.maxMessageLength - 1) {
			promises.push(
				ky
					.post(this.baseUrl + "/sendMessage", {
						json: {
							chat_id: chatId,
							text: text.substring(len, len + this.maxMessageLength - 1),
						},
					})
					.json()
			);
		}
		return Promise.all(promises);
	}
}

export default TelegramService;
