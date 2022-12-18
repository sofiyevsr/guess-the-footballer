package utils

import "os"

func EnsureDirExists(dir string) error {
	err := os.Mkdir(dir, 0755)
	if !os.IsExist(err) && err != nil {
		return err
	}
	return nil
}
