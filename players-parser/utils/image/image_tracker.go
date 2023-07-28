package image

import (
	"fmt"
	"log"
	"math/rand"
	"os"
	"strings"
	"sync"

	"github.com/alitto/pond"
	"github.com/sofiyevsr/transfer-parser/utils"
)

type tracker struct {
	store map[string]string
	mu    sync.Mutex
}

var imageTracker = tracker{store: make(map[string]string)}

func AddImageToBulk(url string, filename string) string {
	filename = strings.ReplaceAll(filename, " ", "-")
	filename = strings.ReplaceAll(filename, ".", "-")
	filename = strings.ReplaceAll(filename, "/", "-")
	filename = fmt.Sprintf("%s.png", strings.ToLower(filename))
	if filename == ".png" {
		filename = fmt.Sprint(rand.Int()) + ".png"
	}
	url = strings.ReplaceAll(url, "verysmall", "head")
	url = strings.ReplaceAll(url, "small", "head")
	url = strings.ReplaceAll(url, "middle", "head")
	url = strings.ReplaceAll(url, "normal", "header")
	imageTracker.mu.Lock()
	imageTracker.store[filename] = url
	imageTracker.mu.Unlock()
	return filename
}

func DownloadImages() {
	if os.Getenv("UPLOAD_IMAGES") != "yes" {
		fmt.Println("Skipping upload images phase...")
		return
	}
	pool := pond.New(50, len(imageTracker.store))
	for k, v := range imageTracker.store {
		filename, url := k, v
		pool.Submit(func() {
			err := utils.DownloadAndUploadImage(url, filename)
			if err != nil {
				log.Fatalf("Error happened while processing image %s: %s", filename, err)
			}
		})
	}
	pool.StopAndWait()
}
