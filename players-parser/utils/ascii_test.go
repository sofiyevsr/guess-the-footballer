package utils

import (
	"testing"
)

func TestNormalCase(t *testing.T) {
	const expected = "Erling Haaland"
	res := ToAscii(expected)
	if res != expected {
		t.Fatalf("Expected %s, got %s", expected, res)
	}
}
