import pMap from "p-map";
import { transfermarktAPI } from "./api";
import formatPlayerData from "./format";

export async function getPlayersFromTransfermarkt(ids: string[]) {
	const players = await pMap(
		ids,
		async (id) => {
			const player = await transfermarktAPI.getPlayerData(id);
			return formatPlayerData(player);
		},
		{ concurrency: 10 }
	);
	return players;
}
