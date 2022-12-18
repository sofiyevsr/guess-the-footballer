package utils

import (
	"log"
	"unicode"

	"golang.org/x/text/runes"
	"golang.org/x/text/transform"
	"golang.org/x/text/unicode/norm"
)

func ToAscii(str string) string {
	t := transform.Chain(norm.NFD, runes.Remove(runes.In(unicode.Mn)), norm.NFC)
	res, _, err := transform.String(t, str)
	if err != nil {
		log.Fatalf("Error while transforming ascii: %s", err)
	}
	return res
}
