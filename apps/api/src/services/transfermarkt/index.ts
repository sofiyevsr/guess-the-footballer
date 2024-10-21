import { PlayerData } from "./_types";
import { transfermarktAPI } from "./api";
import formatPlayerData from "./format";

export async function getPlayersFromTransfermarkt(ids: string[]) {
	const players: PlayerData[] = [];
	const promises = ids.map(async (id) => {
		const player = await transfermarktAPI.getPlayerData(id);
		return formatPlayerData(player);
	});
	for await (const player of promises) {
		players.push(player);
	}
	return players;
}
