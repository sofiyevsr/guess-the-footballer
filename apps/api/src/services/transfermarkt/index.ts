import pMap from "p-map";
import { chunkArray } from "../../utils/misc/common";
import { PlayerData } from "./_types";
import { transfermarktAPI } from "./api";
import formatPlayerData from "./format";

export async function getPlayersFromTransfermarkt(ids: string[]) {
	const players: PlayerData[] = [];
	const chunkIds = chunkArray(ids, 30);
	for (const ids of chunkIds) {
		const chunkPlayers = await pMap(
			ids,
			async (id) => {
				const player = await transfermarktAPI.getPlayerData(id);
				return formatPlayerData(player);
			},
			{ concurrency: 10 }
		);
		players.push(...chunkPlayers);
	}
	return players;
}
