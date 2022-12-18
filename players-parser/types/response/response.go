package response

type AchievementsResponse struct {
	PlayerAchievements []struct {
		Title string `json:"title"`
		Value string `json:"value"`
	} `json:"playerAchievements"`
}

type PerformanceResponse struct {
	CompetitionPerformanceSummery []struct {
		Competition struct {
			ID        string `json:"id"`
			Name      string `json:"name"`
			ShortName string `json:"shortName"`
			Image     string `json:"image"`
		} `json:"competition"`
		Performance struct {
			OwnGoals       int     `json:"ownGoals,string"`
			YellowCards    int     `json:"yellowCards,string"`
			RedCards       int     `json:"redCards,string"`
			MinutesPlayed  float64 `json:"minutesPlayed"`
			PenaltyGoals   int     `json:"penaltyGoals,string"`
			MinutesPerGoal float64 `json:"minutesPerGoal"`
			Matches        int     `json:"matches,string"`
			Goals          int     `json:"goals,string"`
			Assists        int     `json:"assists,string"`
		} `json:"performance"`
	} `json:"competitionPerformanceSummery"`
}

type PlayerShortResponse struct {
	Data struct {
		Player struct {
			Nationalities []struct {
				ID int `json:"id"`
			} `json:"nationalities"`
		} `json:"player"`
	} `json:"data"`
}

type PlayersResponse []SinglePerson

type SinglePerson struct {
	ID int `json:"id,string"`
}

type ProfileResponse struct {
	PlayerProfile struct {
		PlayerID               int    `json:"playerID,string"`
		PlayerName             string `json:"playerName"`
		Birthplace             string `json:"birthplace"`
		DateOfBirth            string `json:"dateOfBirth"`
		PlayerShirtNumber      string `json:"playerShirtNumber"`
		BirthplaceCountry      string `json:"birthplaceCountry"`
		Age                    int    `json:"age,string"`
		Height                 string `json:"height"`
		Foot                   string `json:"foot"`
		InternationalTeam      string `json:"internationalTeam"`
		InternationalTeamImage string `json:"internationalTeamImage"`
		InternationalGames     string `json:"internationalGames"`
		InternationalGoals     string `json:"internationalGoals"`
		Country                string `json:"country"`
		CountryImage           string `json:"countryImage"`
		CountryShortName       string `json:"countryShortName"`
		League                 string `json:"league"`
		LeagueLogo             string `json:"leagueLogo"`
		ClubImage              string `json:"clubImage"`
		Club                   string `json:"club"`
		ClubID                 string `json:"clubID"`
		MarketValue            string `json:"marketValue"`
		MarketValueCurrency    string `json:"marketValueCurrency"`
		MarketValueNumeral     string `json:"marketValueNumeral"`
		PlayerMainPosition     string `json:"playerMainPosition"`
	} `json:"playerProfile"`
}

type TransfersResponse struct {
	TransferHistory []struct {
		OldClubID           string `json:"oldClubID"`
		OldClubName         string `json:"oldClubName"`
		OldClubImage        string `json:"oldClubImage"`
		NewClubID           string `json:"newClubID"`
		NewClubName         string `json:"newClubName"`
		NewClubImage        string `json:"newClubImage"`
		TransferFeeValue    string `json:"transferFeeValue"`
		TransferFeeCurrency string `json:"transferFeeCurrency"`
		TransferFeeNumeral  string `json:"transferFeeNumeral"`
		Date                string `json:"date"`
		Season              string `json:"season"`
		Loan                string `json:"loan"`
	} `json:"transferHistory"`
}
