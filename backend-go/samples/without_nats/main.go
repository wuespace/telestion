package main

import (
	"github.com/wuespace/telestion/backend"
	"log"
)

func main() {
	service, err := telestion.StartService(telestion.WithoutNats())
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Telestion service is running!")

	log.Printf("Data directory: %s", service.DataDir)
}
