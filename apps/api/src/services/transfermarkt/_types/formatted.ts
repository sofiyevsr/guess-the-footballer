export interface PlayerData {
	id: number;
	playerName: string;
	birthplace: string;
	birthplaceCountry: string;
	dateOfBirth: string;
	shirtNumber: number;
	age: number;
	height: string;
	foot: string;
	internationalTeam: string;
	internationalTeamImage: string;
	internationalGames: number;
	internationalGoals: number;
	countryName: string;
	countryImage: string;
	countryShortName: string;
	leagueName: string;
	leagueLogo: string;
	clubID: number;
	clubName: string;
	clubImage: string;
	marketValue: number;
	marketValueCurrency: string;
	marketValueNumeral: string;
	playerMainPosition: string;
	achievements: PlayerAchievement[];
	performanceData: PlayerPerformanceData[];
	transferHistory: PlayerTransfer[];
}

interface PlayerPerformanceData {
	competition: PlayerPerformanceCompetition;
	performance: PlayerPerformance;
}

interface PlayerPerformanceCompetition {
	id: string;
	name: string;
	shortName: string;
	image: string;
}

interface PlayerPerformance {
	ownGoals: number;
	yellowCards: number;
	redCards: number;
	minutesPlayed: number;
	minutesPerGoal: number;
	penaltyGoals: number;
	matches: number;
	goals: number;
	assists: number;
}

interface PlayerAchievement {
	title: string;
	value: number;
}

interface PlayerTransfer {
	oldClubID: number;
	oldClubName: string;
	oldClubImage: string;
	newClubID: number;
	newClubName: string;
	newClubImage: string;
	transferFeeValue: number;
	transferFeeCurrency: string;
	transferFeeNumeral: string;
	date: string;
	season: string;
	isLoan: boolean;
}
