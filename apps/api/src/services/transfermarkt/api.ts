import ky from "ky";
import {
	AchievementsResponse,
	PerformancesResponse,
	ProfileResponse,
	SearchPlayerResponse,
	SinglePerson,
	TransfersResponse,
} from "./_types";
import { TRANSFERMARKT_HEADERS } from "../../utils/constants";

const allPlayersURL =
	"https://transfermarkt.com/api/overview/appPlayerMarketValue";
const playerURL = "https://transfermarkt.com/api/profil/AppPlayer/";
const transfersURL = "https://transfermarkt.com/api/transfers/AppPlayer/";
const achievementsURL = "https://transfermarkt.com/api/erfolge/AppPlayer";
const performanceURL =
	"https://transfermarkt.com/api/performanceSummery/appPlayer";
const searchPlayerURL =
	"https://www.transfermarkt.de/schnellsuche/ergebnis/schnellsuche";
const TIMEOUT = 10000;
const LIMIT = 1;

async function getPlayersByMarketValue(limit: number, offset: number) {
	const response = await ky
		.get(allPlayersURL, {
			searchParams: { limit, offset },
			timeout: TIMEOUT,
			retry: { limit: LIMIT },
			headers: TRANSFERMARKT_HEADERS,
		})
		.json<SinglePerson[]>();
	return response;
}

async function getPlayerData(playerID: string) {
	const [profile, transfers, achievements, performances] = await Promise.all([
		getProfile(playerID),
		getTransfers(playerID),
		getAchievements(playerID),
		getPerformances(playerID),
	]);
	return { profile, transfers, achievements, performances };
}

async function getProfile(playerID: string) {
	const response = await ky
		.get(playerURL + playerID, {
			timeout: TIMEOUT,
			retry: { limit: LIMIT },
			headers: TRANSFERMARKT_HEADERS,
		})
		.json<ProfileResponse>();
	return response;
}

async function getTransfers(playerID: string) {
	const response = await ky
		.get(transfersURL + playerID, {
			timeout: TIMEOUT,
			retry: { limit: LIMIT },
			headers: TRANSFERMARKT_HEADERS,
		})
		.json<TransfersResponse>();
	return response;
}

async function getAchievements(playerID: string) {
	const response = await ky
		.get(achievementsURL, {
			searchParams: { id: playerID },
			timeout: TIMEOUT,
			retry: { limit: LIMIT },
			headers: TRANSFERMARKT_HEADERS,
		})
		.json<AchievementsResponse>();
	return response;
}

async function getPerformances(playerID: string) {
	const response = await ky
		.get(performanceURL, {
			timeout: TIMEOUT,
			retry: { limit: LIMIT },
			searchParams: { fullCareer: true, id: playerID },
			headers: TRANSFERMARKT_HEADERS,
		})
		.json<PerformancesResponse>();
	return response;
}

async function searchPlayer(query: string) {
	const response = await ky
		.get(searchPlayerURL, {
			timeout: TIMEOUT,
			retry: { limit: LIMIT },
			searchParams: { query, opt: 1 },
			headers: { Accept: "application/json" },
		})
		.json<SearchPlayerResponse>();
	return response;
}

export const transfermarktAPI = {
	getPlayersByMarketValue,
	getPlayerData,
	searchPlayer,
};
