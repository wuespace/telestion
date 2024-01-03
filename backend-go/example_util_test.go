package telestion_test

import (
	"github.com/nats-io/nats.go"
	"github.com/wuespace/telestion/backend-go"
)

// The WaitForInterrupt function waits for an external interrupt
// to prevent immediate shutdown of the service.
func ExampleWaitForInterrupt() {
	// start a new Telestion service
	service, _ := telestion.StartService()

	// subscribe to a subject on the message bus
	_, _ = service.Nc.Subscribe("subject", func(msg *nats.Msg) {
		//...
	})

	// wait for external interrupt to prevent immediate shutdown of service
	telestion.WaitForInterrupt()

	// drain NATS connections
	_, _ = service.Drain()
}
