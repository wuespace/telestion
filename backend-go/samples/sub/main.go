package main

import (
	"github.com/nats-io/nats.go"
	"github.com/wuespace/telestion/backend-go"
	"log"
	"os"
	"os/signal"
)

const (
	Subject = "publish_fast"
)

func main() {
	log.Println("Setup service")
	service, err := telestion.StartService()
	if err != nil {
		log.Fatal(err)
	}

	log.Println("Subscribing to subject...")
	counter := 0
	_, err = service.Nc.Subscribe(Subject, func(msg *nats.Msg) {
		counter++
		//log.Printf("Counter: %d", counter)
		//log.Printf("%s\n", string(msg.Data))
	})
	if err != nil {
		log.Println(err)
	}

	log.Println("Waiting for incoming messages...")
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	<-c

	log.Println("Draining...")
	if err1, err2 := service.Drain(); err1 != nil || err2 != nil {
		log.Println(err1, err2)
	}
	log.Println("Exit process")
}
