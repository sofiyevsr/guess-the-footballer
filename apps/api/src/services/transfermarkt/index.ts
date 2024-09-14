import { ImageHolder } from "../../utils/imageHolder";
import { transfermarktAPI } from "./api";
import formatPlayerData from "./format";
import { PlayerData } from "./_types";
import pMap from "p-map";

export async function getPlayersFromTransfermarkt(ids: string[], r2: R2Bucket) {
	const mainImageHolder = new ImageHolder();
	const result = await pMap(
		ids,
		async (id) => {
			const player = await transfermarktAPI.getPlayerData(id);
			return formatPlayerData(player);
		},
		{ concurrency: 40 }
	);
	const players = result.reduce((acc, res) => {
		acc.push(res.formattedPlayer);
		mainImageHolder.mergeImageHolder(res.imageHolder);
		return acc;
	}, [] as PlayerData[]);
	await mainImageHolder.downloadAndSaveImages(r2);
	return players;
}
