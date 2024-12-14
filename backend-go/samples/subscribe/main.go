package main

import (
	"fmt"
	"github.com/nats-io/nats.go"
	. "github.com/wuespace/telestion/backend-go"
)

func main() {
	service, err := StartService()
	if err != nil {
		panic(err)
	}
	defer service.Drain()

	sub, err := service.Nc.Subscribe("subject", func(msg *nats.Msg) {
		fmt.Printf("Received message: %s\n", string(msg.Data))
	})
	if err != nil {
		panic(err)
	}

	err = sub.AutoUnsubscribe(10)
	if err != nil {
		panic(err)
	}

	WaitForInterrupt()
}
