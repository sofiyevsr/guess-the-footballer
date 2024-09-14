import { ImageHolder } from "../../utils/imageHolder";
import { shuffleArray } from "../../utils/misc/common";
import {
	AchievementsResponse,
	PerformancesResponse,
	PlayerData,
	RawPlayerData,
	TransfersResponse,
} from "./_types";
import { removeDiacritics } from "./_utils/ascii";
import { parseInteger, parseTransferValue } from "./_utils/parse";

export default function formatPlayerData(player: RawPlayerData) {
	const imageHolder = new ImageHolder();
	const formattedPlayer: PlayerData = {
		id: parseInteger(player.profile.playerProfile.playerID),
		playerName: removeDiacritics(player.profile.playerProfile.playerName),
		countryShortName: player.profile.playerProfile.countryShortName,
		dateOfBirth: player.profile.playerProfile.dateOfBirth,
		marketValue: parseTransferValue(player.profile.playerProfile.marketValue),
		age: parseInteger(player.profile.playerProfile.age),
		foot: player.profile.playerProfile.foot,
		clubID: parseInteger(player.profile.playerProfile.clubID),
		height: player.profile.playerProfile.height,
		clubName: formatClubName(player.profile.playerProfile.club),
		birthplace: player.profile.playerProfile.birthplace,
		birthplaceCountry: player.profile.playerProfile.birthplaceCountry,
		leagueName: player.profile.playerProfile.league,
		shirtNumber: parseInteger(player.profile.playerProfile.playerShirtNumber),
		countryName: player.profile.playerProfile.country,
		internationalTeam: player.profile.playerProfile.internationalTeam,
		internationalGoals: parseInteger(
			player.profile.playerProfile.internationalGoals
		),
		internationalGames: parseInteger(
			player.profile.playerProfile.internationalGames
		),
		playerMainPosition: player.profile.playerProfile.playerMainPosition,
		marketValueNumeral: player.profile.playerProfile.marketValueNumeral,
		marketValueCurrency: player.profile.playerProfile.marketValueCurrency,
		clubImage: imageHolder.addImage(
			player.profile.playerProfile.club,
			player.profile.playerProfile.clubImage
		),
		leagueLogo: imageHolder.addImage(
			player.profile.playerProfile.league,
			player.profile.playerProfile.leagueLogo
		),
		countryImage: imageHolder.addImage(
			player.profile.playerProfile.country,
			player.profile.playerProfile.countryImage
		),
		internationalTeamImage: imageHolder.addImage(
			player.profile.playerProfile.internationalTeam,
			player.profile.playerProfile.internationalTeamImage
		),
		transferHistory: [],
		achievements: [],
		performanceData: [],
	};
	formatTransfers(player.transfers, formattedPlayer, imageHolder);
	formatAchievements(player.achievements, formattedPlayer);
	formatPerformances(player.performances, formattedPlayer, imageHolder);
	return { formattedPlayer, imageHolder };
}

function formatTransfers(
	transfers: TransfersResponse,
	player: PlayerData,
	imageHolder: ImageHolder
) {
	player.transferHistory = shuffleArray(
		transfers.transferHistory.map((transfer) => ({
			season: transfer.season,
			transferFeeNumeral: transfer.transferFeeNumeral,
			transferFeeCurrency: transfer.transferFeeCurrency,
			date: transfer.date,
			oldClubName: formatClubName(transfer.oldClubName),
			newClubName: formatClubName(transfer.newClubName),
			oldClubID: parseInteger(transfer.oldClubID),
			newClubID: parseInteger(transfer.newClubID),
			transferFeeValue: parseTransferValue(transfer.transferFeeValue),
			isLoan: transfer.loan === "ist",
			oldClubImage: imageHolder.addImage(
				transfer.oldClubName,
				transfer.oldClubImage
			),
			newClubImage: imageHolder.addImage(
				transfer.newClubName,
				transfer.newClubImage
			),
		}))
	);
}

function formatAchievements(
	achievements: AchievementsResponse,
	player: PlayerData
) {
	player.achievements = shuffleArray(
		achievements.playerAchievements.map((achievement) => {
			const parsed = parseInteger(achievement.value.slice(0, -1));
			return { title: achievement.title, value: parsed };
		})
	);
}

function formatPerformances(
	performances: PerformancesResponse,
	player: PlayerData,
	imageHolder: ImageHolder
) {
	player.performanceData = shuffleArray(
		performances.competitionPerformanceSummery.reduce(
			(acc, { performance, competition }) => {
				if (performance.minutesPlayed > 180)
					acc.push({
						performance: {
							minutesPerGoal: performance.minutesPerGoal,
							minutesPlayed: performance.minutesPlayed,
							ownGoals: parseInteger(performance.ownGoals),
							yellowCards: parseInteger(performance.yellowCards),
							redCards: parseInteger(performance.redCards),
							goals: parseInteger(performance.goals),
							penaltyGoals: parseInteger(performance.penaltyGoals),
							assists: parseInteger(performance.assists),
							matches: parseInteger(performance.matches),
						},
						competition: {
							id: competition.id,
							shortName: competition.shortName,
							name: competition.name,
							image: imageHolder.addImage(competition.name, competition.image),
						},
					});
				return acc;
			},
			[] as PlayerData["performanceData"]
		)
	);
}

function formatClubName(club: string) {
	if (club === "Karriereende") club = "Retired";
	else if (club === "Vereinslos") club = "Free agent";
	return club;
}
