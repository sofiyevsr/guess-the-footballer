export interface RawPlayerData {
	profile: ProfileResponse;
	transfers: TransfersResponse;
	achievements: AchievementsResponse;
	performances: PerformancesResponse;
}

export interface SinglePerson {
	id: string;
}

export interface AchievementsResponse {
	playerAchievements: {
		title: string;
		value: string;
	}[];
}

export interface PerformancesResponse {
	competitionPerformanceSummery: {
		competition: {
			id: string;
			name: string;
			shortName: string;
			image: string;
		};
		performance: {
			ownGoals: string;
			yellowCards: string;
			redCards: string;
			minutesPlayed: number;
			penaltyGoals: string;
			minutesPerGoal: number;
			matches: string;
			goals: string;
			assists: string;
		};
	}[];
}

export interface ProfileResponse {
	playerProfile: {
		playerID: string;
		playerName: string;
		birthplace: string;
		dateOfBirth: string;
		playerShirtNumber: string;
		birthplaceCountry: string;
		age: string;
		height: string;
		foot: string;
		internationalTeam: string;
		internationalTeamImage: string;
		internationalGames: string;
		internationalGoals: string;
		country: string;
		countryImage: string;
		countryShortName: string;
		league: string;
		leagueLogo: string;
		clubImage: string;
		club: string;
		clubID: string;
		marketValue: string;
		marketValueCurrency: string;
		marketValueNumeral: string;
		playerMainPosition: string;
	};
}

export interface TransfersResponse {
	transferHistory: {
		oldClubID: string;
		oldClubName: string;
		oldClubImage: string;
		newClubID: string;
		newClubName: string;
		newClubImage: string;
		transferFeeValue: string;
		transferFeeCurrency: string;
		transferFeeNumeral: string;
		date: string;
		season: string;
		loan: string;
	}[];
}

export interface SearchPlayerResponse {
	players: {
		id: string;
		playerName: string;
		firstName: string;
		lastName: string;
		alias: string;
		nationImage: string;
		club: string;
		playerImage: string;
	}[];
}
