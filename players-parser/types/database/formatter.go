package database

import (
	"strconv"
	"strings"

	"github.com/sofiyevsr/transfer-parser/types/response"
	"github.com/sofiyevsr/transfer-parser/utils"
	"github.com/sofiyevsr/transfer-parser/utils/image"
)

func (player *Player) FromTransfers(transfers response.TransfersResponse) {
	player.TransferHistory = []PlayerTransfer{}
	for _, v := range transfers.TransferHistory {
		transferValue := utils.ParseTransferValue(v.TransferFeeValue)
		if v.TransferFeeNumeral != "m" || transferValue < 1 {
			continue
		}
		player.TransferHistory = append(player.TransferHistory, PlayerTransfer{
			OldClubID:           utils.ParseInt(v.OldClubID),
			OldClubName:         v.OldClubName,
			OldClubImage:        image.AddImageToBulk(v.OldClubImage, v.OldClubName),
			NewClubID:           utils.ParseInt(v.NewClubID),
			NewClubName:         v.NewClubName,
			NewClubImage:        image.AddImageToBulk(v.NewClubImage, v.NewClubName),
			TransferFeeValue:    transferValue,
			TransferFeeCurrency: v.TransferFeeCurrency,
			TransferFeeNumeral:  v.TransferFeeNumeral,
			Date:                v.Date,
			Season:              v.Season,
			IsLoan:              v.Loan == "ist",
		})
	}
}

func (player *Player) FromAchievements(achievements response.AchievementsResponse) {
	player.Achievements = []PlayerAchievement{}
	for _, v := range achievements.PlayerAchievements {
		parsed, err := strconv.Atoi(v.Value[:len(v.Value)-1])
		if err != nil {
			panic(err)
		}
		player.Achievements = append(player.Achievements, PlayerAchievement{Title: v.Title, Value: parsed})
	}
}

func (player *Player) FromPerformance(performance response.PerformanceResponse) {
	player.PerformanceData = []PlayerPerformanceData{}
	for _, v := range performance.CompetitionPerformanceSummery {
		if v.Performance.MinutesPlayed < 500 {
			continue
		}
		player.PerformanceData = append(player.PerformanceData, PlayerPerformanceData{
			Competition: PlayerPerformanceCompetition{
				ID:        v.Competition.ID,
				Name:      v.Competition.Name,
				ShortName: v.Competition.ShortName,
				Image:     image.AddImageToBulk(v.Competition.Image, v.Competition.Name),
			},
			Performance: PlayerPerformance{
				OwnGoals:       v.Performance.OwnGoals,
				YellowCards:    v.Performance.YellowCards,
				RedCards:       v.Performance.RedCards,
				MinutesPlayed:  v.Performance.MinutesPlayed,
				MinutesPerGoal: v.Performance.MinutesPerGoal,
				PenaltyGoals:   v.Performance.PenaltyGoals,
				Matches:        v.Performance.Matches,
				Goals:          v.Performance.Goals,
				Assists:        v.Performance.Assists,
			},
		})
	}
}

func (player *Player) FromProfile(profile response.ProfileResponse) {
	clubID := utils.ParseInt(profile.PlayerProfile.ClubID)
	// 515 is without club
	if clubID == 515 {
		clubID = -1
	}
	player.ForeignID = profile.PlayerProfile.PlayerID
	player.PlayerName = utils.ToAscii(profile.PlayerProfile.PlayerName)
	player.PlayerName = strings.ReplaceAll(player.PlayerName, "-", " ")
	player.Birthplace = profile.PlayerProfile.Birthplace
	player.BirthplaceCountry = profile.PlayerProfile.BirthplaceCountry
	player.DateOfBirth = profile.PlayerProfile.DateOfBirth
	player.ShirtNumber = utils.ParseInt(profile.PlayerProfile.PlayerShirtNumber)
	player.Age = profile.PlayerProfile.Age
	player.Height = profile.PlayerProfile.Height
	player.Foot = profile.PlayerProfile.Foot
	player.InternationalTeam = profile.PlayerProfile.InternationalTeam
	player.InternationalTeamImage = image.AddImageToBulk(profile.PlayerProfile.InternationalTeamImage, profile.PlayerProfile.InternationalTeam)
	player.InternationalGames = utils.ParseInt(profile.PlayerProfile.InternationalGames)
	player.InternationalGoals = utils.ParseInt(profile.PlayerProfile.InternationalGoals)
	player.CountryName = profile.PlayerProfile.Country
	player.CountryImage = image.AddImageToBulk(profile.PlayerProfile.CountryImage, profile.PlayerProfile.Country)
	player.CountryShortName = profile.PlayerProfile.CountryShortName
	player.LeagueName = profile.PlayerProfile.League
	player.LeagueLogo = image.AddImageToBulk(profile.PlayerProfile.LeagueLogo, profile.PlayerProfile.League)
	player.ClubID = clubID
	player.ClubName = profile.PlayerProfile.Club
	player.ClubImage = image.AddImageToBulk(profile.PlayerProfile.ClubImage, profile.PlayerProfile.Club)
	player.MarketValue = utils.ParseTransferValue(profile.PlayerProfile.MarketValue)
	player.MarketValueCurrency = profile.PlayerProfile.MarketValueCurrency
	player.MarketValueNumeral = profile.PlayerProfile.MarketValueNumeral
	player.PlayerMainPosition = profile.PlayerProfile.PlayerMainPosition
}
