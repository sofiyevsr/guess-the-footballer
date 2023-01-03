package database

type Player struct {
	ID                     int                     `json:"id"`
	ForeignID              int                     `json:"foreignID"`
	PlayerName             string                  `json:"playerName"`
	Birthplace             string                  `json:"birthplace"`
	BirthplaceCountry      string                  `json:"birthplaceCountry"`
	DateOfBirth            string                  `json:"dateOfBirth"`
	ShirtNumber            int                     `json:"shirtNumber"`
	Age                    int                     `json:"age"`
	Height                 string                  `json:"height"`
	Foot                   string                  `json:"foot"`
	InternationalTeam      string                  `json:"internationalTeam"`
	InternationalTeamImage string                  `json:"internationalTeamImage"`
	InternationalGames     int                     `json:"internationalGames"`
	InternationalGoals     int                     `json:"internationalGoals"`
	CountryName            string                  `json:"countryName"`
	CountryImage           string                  `json:"countryImage"`
	CountryShortName       string                  `json:"countryShortName"`
	LeagueName             string                  `json:"leagueName"`
	LeagueLogo             string                  `json:"leagueLogo"`
	ClubID                 int                     `json:"clubID"`
	ClubName               string                  `json:"clubName"`
	ClubImage              string                  `json:"clubImage"`
	MarketValue            float64                 `json:"marketValue"`
	MarketValueCurrency    string                  `json:"marketValueCurrency"`
	MarketValueNumeral     string                  `json:"marketValueNumeral"`
	PlayerMainPosition     string                  `json:"playerMainPosition"`
	Achievements           []PlayerAchievement     `json:"achievements"`
	PerformanceData        []PlayerPerformanceData `json:"performanceData"`
	TransferHistory        []PlayerTransfer        `json:"transferHistory"`
}

type PlayerPerformanceData struct {
	Competition PlayerPerformanceCompetition `json:"competition"`
	Performance PlayerPerformance            `json:"performance"`
}

type PlayerPerformanceCompetition struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	ShortName string `json:"shortName"`
	Image     string `json:"image"`
}

type PlayerPerformance struct {
	OwnGoals       int     `json:"ownGoals"`
	YellowCards    int     `json:"yellowCards"`
	RedCards       int     `json:"redCards"`
	MinutesPlayed  float64 `json:"minutesPlayed"`
	MinutesPerGoal float64 `json:"minutesPerGoal"`
	PenaltyGoals   int     `json:"penaltyGoals"`
	Matches        int     `json:"matches"`
	Goals          int     `json:"goals"`
	Assists        int     `json:"assists"`
}

type PlayerAchievement struct {
	Title string `json:"title"`
	Value int    `json:"value"`
}

type PlayerTransfer struct {
	OldClubID           int     `json:"oldClubID"`
	OldClubName         string  `json:"oldClubName"`
	OldClubImage        string  `json:"oldClubImage"`
	NewClubID           int     `json:"newClubID"`
	NewClubName         string  `json:"newClubName"`
	NewClubImage        string  `json:"newClubImage"`
	TransferFeeValue    float64 `json:"transferFeeValue"`
	TransferFeeCurrency string  `json:"transferFeeCurrency"`
	TransferFeeNumeral  string  `json:"transferFeeNumeral"`
	Date                string  `json:"date"`
	Season              string  `json:"season"`
	IsLoan              bool    `json:"isLoan"`
}
