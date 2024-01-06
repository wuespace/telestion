package main

import (
	"github.com/nats-io/nats.go"
	"github.com/wuespace/telestion/backend-go"
	"log"
)

const (
	// MonitoredSubject is the message bus subject the subscriber listens for new messages.
	MonitoredSubject = "sample_data"
)

func main() {
	// start a new Telestion service
	service, err := telestion.StartService()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Service started")

	counter := 0
	// subscribe to message bus subject
	_, err = service.Nc.Subscribe(MonitoredSubject, func(msg *nats.Msg) {
		counter++
		log.Printf("Counter: %d", counter)
		log.Printf("%s\n", string(msg.Data))
	})
	if err != nil {
		log.Println(err)
	}

	log.Println("Waiting for incoming messages...")
	telestion.WaitForInterrupt()

	// drain remaining messages and close connection
	if err1, err2 := service.Drain(); err1 != nil || err2 != nil {
		log.Println(err1, err2)
	}
	log.Println("Service stopped")
}
