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

func TestNorwayLetter(t *testing.T) {
	const input = "Øødegaard"
  const expected = "Oodegaard"
	res := ToAscii(input)
	if res != expected {
		t.Fatalf("Expected %s, got %s", expected, res)
	}
}
