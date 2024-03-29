package types

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"sync"
	"time"

	"github.com/sofiyevsr/transfer-parser/api"
	"github.com/sofiyevsr/transfer-parser/types/database"
	"github.com/sofiyevsr/transfer-parser/utils"
)

type KV struct {
	Id    int    `json:"id"`
	Value string `json:"value"`
}

type PlayersHolder struct {
	Players []database.Player
	mu      sync.Mutex
}

func (holder *PlayersHolder) AddPlayer(player database.Player) {
	holder.mu.Lock()
	defer holder.mu.Unlock()
	holder.Players = append(holder.Players, player)
}

func (holder *PlayersHolder) WriteToFile(filename string) {
	kvData := []KV{}
	for _, v := range holder.Players {
		playerJSON, err := json.Marshal(v)
		if err != nil {
			log.Fatalf("Cannot encode json: %s, player data: %v", err, v)
		}
		kvData = append(kvData, KV{Id: v.ID, Value: string(playerJSON)})
	}
	playersJSON, err := json.Marshal(kvData)
	if err != nil {
		log.Fatalf("Cannot encode json: %s", err)
	}
	err = utils.EnsureDirExists("dist")
	if err != nil {
		log.Fatalf("Cannot create folder dist: %s", err)
	}
	err = ioutil.WriteFile(fmt.Sprintf("dist/%s-%d.json", filename, time.Now().Unix()), playersJSON, 0644)
	if err != nil {
		log.Fatalf("Cannot write json to file: %s", err)
	}
	fmt.Printf("Wrote data to file, player count: %d, expected: %d \n", len(kvData), api.PlayersLimit)
}
