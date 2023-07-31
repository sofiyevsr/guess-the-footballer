package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
)

func Fetch(url string, data any) error {
	client := &http.Client{}
	req, _ := http.NewRequest("GET", url, nil)
  req.Header.Add("User-Agent", "Mozilla/5.0")
	res, err := client.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		body, _ := io.ReadAll(res.Body)
		return errors.New(fmt.Sprintf("Received error with status %d, %s", res.StatusCode, body))
	}

	err = json.NewDecoder(res.Body).Decode(data)
	if err != nil {
		return err
	}
	return nil
}
