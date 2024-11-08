type EventType = "multiplayer_game_finished" | "multiplayer_game_started";

export const sa = {
	logEvent: async (event: EventType, hostname: string) => {
		return await fetch("https://queue.simpleanalyticscdn.com/events", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				type: "event",
				hostname,
				event,
				ua: "Server",
			}),
		});
	},
};
