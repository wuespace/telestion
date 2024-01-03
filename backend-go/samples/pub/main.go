package main

import (
	"github.com/wuespace/telestion/backend-go"
	"log"
	"time"
)

const (
	// PublishCount is the number of messages the publisher should send.
	PublishCount = 100_000

	// PublishSubject is the message bus subject the publisher should send the message.
	PublishSubject = "sample_data"

	// PublishMessage is the message that the publisher sends on the message bus.
	PublishMessage = "Hello from Telestion!" // or use TelestionLogo for a big message (~163 KiB)

	// SleepTime is the between two publications.
	SleepTime = 1 * time.Millisecond
)

func main() {
	// start a new Telestion service
	service, err := telestion.StartService()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Service started")

	log.Printf("Publish %d messages...", PublishCount)
	for i := 0; i < PublishCount; i++ {
		// publish a message on the message bus
		_ = service.Nc.Publish(PublishSubject, []byte(PublishMessage))
		time.Sleep(SleepTime)
	}
	log.Printf("Finished!")

	// drain remaining messages and close connection
	if err1, err2 := service.Drain(); err1 != nil || err2 != nil {
		log.Fatal(err1, err2)
	}
	log.Printf("Service stopped")
}
