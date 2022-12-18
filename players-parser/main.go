package main

import (
	"fmt"
	"log"
	"time"

	"github.com/alitto/pond"
	"github.com/joho/godotenv"
	"github.com/sofiyevsr/transfer-parser/api"
	"github.com/sofiyevsr/transfer-parser/types"
	"github.com/sofiyevsr/transfer-parser/types/database"
	"github.com/sofiyevsr/transfer-parser/utils"
	"github.com/sofiyevsr/transfer-parser/utils/image"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	start := time.Now()
	bulk, err := api.GetPlayersByMarketValue()
	if err != nil {
		log.Fatalf("couldn't get players, %s", err)
	}
	length := len(bulk)
	fmt.Printf("Starting to process %d players...\n", length)
	pool := pond.New(100, length)
	playerPool := types.PlayersHolder{Players: []database.Player{}}
	minusOffset := 1
	for k, v := range bulk {
		key, value := k, v
		pool.Submit(func() {
			player, err := api.GetPlayerData(value.ID)
			if err != nil {
				fmt.Printf("Request failed for player id: %d, error: %s", value.ID, err)
				minusOffset--
				return
			}
			player.ID = key + minusOffset
			playerPool.AddPlayer(player)
		})
	}
	pool.StopAndWait()
  utils.InitializeR2()
	image.DownloadImages()
	playerPool.WriteToFile("players")
	fmt.Printf("elapsed time %f \n", time.Now().Sub(start).Seconds())
}
