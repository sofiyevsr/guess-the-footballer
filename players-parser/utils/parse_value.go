package utils

import (
	"strconv"
	"strings"
)

func ParseTransferValue(val string) float64 {
	val = strings.ReplaceAll(val, ",", ".")
	parsed, err := strconv.ParseFloat(val, 64)
	if err != nil {
		return -1
	}
	return parsed
}

func ParseInt(val string) int {
	parsed, err := strconv.Atoi(val)
	if err != nil {
		return -1
	}
	return parsed
}
