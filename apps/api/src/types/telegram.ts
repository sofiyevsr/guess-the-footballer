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

interface Message {
  message_id: number;
  message_thread_id?: number | undefined;
  from?: User | undefined;
  date: number;
  chat: Chat;
  reply_to_message?: Message | undefined;
  text?: string | undefined;
}

export interface TelegramBody {
	message: Message;
}
