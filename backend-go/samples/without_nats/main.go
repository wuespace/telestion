package main

import (
	"github.com/wuespace/telestion/backend-go"
	"log"
)

func main() {
	// Run without establishing a NATS connection. Especially useful during development
	service, err := telestion.StartService(telestion.WithoutNats())
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Telestion service is running!")

	log.Printf("Data directory: %s", service.DataDir)
}
