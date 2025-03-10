export type DBPlayer = {
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
	achievements: {
		title: string;
		value: number;
	}[];
};
