package main

import (
	"github.com/wuespace/telestion/backend"
	"log"
	"time"
)

const (
	Count     = 100_000
	SleepTime = 1 * time.Millisecond
	Subject   = "publish_fast"
)

func main() {
	log.Println("Setup service")
	service, err := telestion.StartService()
	if err != nil {
		log.Fatal(err)
	}

	log.Printf("Publish %d messages...", Count)
	for i := 0; i < Count; i++ {
		_ = service.Nc.Publish(Subject, []byte(BigMessage))
		time.Sleep(SleepTime)
	}
	log.Printf("Finished!")

	if err1, err2 := service.Drain(); err1 != nil || err2 != nil {
		log.Fatal(err1, err2)
	}
	log.Printf("Exit process")
}
