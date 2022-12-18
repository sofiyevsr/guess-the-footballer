package api

import (
	"errors"
	"fmt"
	"log"

	"github.com/sofiyevsr/transfer-parser/types/database"
	"github.com/sofiyevsr/transfer-parser/types/response"
	"github.com/sofiyevsr/transfer-parser/utils"
)

const allPlayersURL = "https://www.transfermarkt.com/api/overview/appPlayerMarketValue?limit="
const transfersURL = "https://www.transfermarkt.com/api/transfers/AppPlayer/"
const achievementsURL = "https://www.transfermarkt.com/api/erfolge/AppPlayer?id="
const performanceURL = "https://www.transfermarkt.com/api/performanceSummery/appPlayer?fullCareer=true&id="
const playerURL = "https://www.transfermarkt.com/api/profil/AppPlayer/"
const shortPlayerURL = "https://www.transfermarkt.com/api/header/appPlayer?id="

func GetPlayersByMarketValue() (response.PlayersResponse, error) {
	res := response.PlayersResponse{}
	err := utils.Fetch(allPlayersURL+fmt.Sprint(PlayersLimit), &res)
	if err != nil {
		return res, err
	}
	return res, nil
}

func GetPlayerData(playerID int) (database.Player, error) {
	player := database.Player{}
	err := preCheck(playerID)
	if err != nil {
		return player, err
	}
	var (
		profile      response.ProfileResponse
		transfers    response.TransfersResponse
		achievements response.AchievementsResponse
		performances response.PerformanceResponse
	)

	errorChan := make(chan error, 4)

	go func(playerID int, profile *response.ProfileResponse, errorChan chan<- error) {
		err = utils.Fetch(playerURL+fmt.Sprint(playerID), profile)
		errorChan <- err
	}(playerID, &profile, errorChan)

	go func(playerID int, transfers *response.TransfersResponse, errorChan chan<- error) {
		err = utils.Fetch(transfersURL+fmt.Sprint(playerID), transfers)
		errorChan <- err
	}(playerID, &transfers, errorChan)

	go func(playerID int, achievements *response.AchievementsResponse, errorChan chan<- error) {
		err = utils.Fetch(achievementsURL+fmt.Sprint(playerID), achievements)
		errorChan <- err
	}(playerID, &achievements, errorChan)

	go func(playerID int, performances *response.PerformanceResponse, errorChan chan<- error) {
		err = utils.Fetch(performanceURL+fmt.Sprint(playerID), performances)
		errorChan <- err
	}(playerID, &performances, errorChan)

	for i := 0; i < 4; i++ {
		err = <-errorChan
		if err != nil {
			log.Fatalf("One of requests failed for player id: %d, error: %s", playerID, err)
		}
	}
	player.FromProfile(profile)
	player.FromAchievements(achievements)
	player.FromTransfers(transfers)
	player.FromPerformance(performances)
	return player, nil
}

func preCheck(playerID int) error {
	short := response.PlayerShortResponse{}
	err := utils.Fetch(shortPlayerURL+fmt.Sprint(playerID), &short)
	if err != nil {
		return err
	}
	for _, v := range short.Data.Player.Nationalities {
		if v.ID == 10 {
			return errors.New("Should be ignored")
		}
	}
	return nil
}
