package main

import (
	"github.com/wuespace/telestion/backend"
	"log"
)

func main() {
	service, err := telestion.StartService()
	if err != nil {
		log.Fatal(err)
	}

	// TODO: Write custom config decoder with mapstructure
	_ = service.Config.CustomConfig["test"]

	telestion.WaitForInterrupt()

	if err1, err2 := service.Drain(); err1 != nil || err2 != nil {
		log.Fatal(err1, err2)
	}
}
