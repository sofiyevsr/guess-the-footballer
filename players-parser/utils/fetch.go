package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
)

func Fetch(url string, data any) error {
	res, err := http.Get(url)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	if res.StatusCode != 200 {
		return errors.New(fmt.Sprintf("Received error with status %d", res.StatusCode))
	}

	err = json.NewDecoder(res.Body).Decode(data)
	if err != nil {
		return err
	}
	return nil
}
