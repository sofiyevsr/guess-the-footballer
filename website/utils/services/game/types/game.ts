export const gameDifficulties = [
  "very-easy",
  "easy",
  "medium",
  "hard",
  "very-hard",
] as const;

export const gameDifficultyNames: {
  [K in (typeof gameDifficulties)[number]]: string;
} = {
  "very-easy": "Very Easy",
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  "very-hard": "Very Hard",
} as const;

export interface SinglePlayerData {
  id: number;
  playerName: string;
  birthplace: string;
  birthplaceCountry: string;
  dateOfBirth: string;
  shirtNumber: number; // -1
  age: number;
  height: string;
  foot: string;
  internationalTeam: string;
  internationalTeamImage: string;
  internationalGames: number; // -1
  internationalGoals: number; // -1
  countryName: string;
  countryImage: string;
  countryShortName: string;
  leagueName: string;
  leagueLogo: string;
  clubID: number; // -1
  clubName: string;
  clubImage: string;
  marketValue: number;
  marketValueCurrency: "€";
  marketValueNumeral: "m";
  playerMainPosition: string;
  achievements: {
    title: string;
    value: number;
  }[];
  performanceData: {
    competition: {
      id: string;
      name: string;
      shortName: string;
      image: string;
    };
    performance: {
      ownGoals: number;
      yellowCards: number;
      redCards: number;
      minutesPlayed: number;
      minutesPerGoal: number;
      penaltyGoals: number;
      matches: number;
      goals: number;
      assists: number;
    };
  }[];
  transferHistory: {
    oldClubID: number; // -1
    oldClubName: string;
    oldClubImage: string;
    newClubID: number; // -1
    newClubName: string;
    newClubImage: string;
    transferFeeValue: number;
    transferFeeCurrency: "€";
    transferFeeNumeral: "m";
    date: string;
    season: string;
    isLoan: boolean;
  }[];
}
