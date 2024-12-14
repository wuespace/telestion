package telestion

import "github.com/nats-io/nats.go"

// The bare-bones Telestion service code.
func Example() {
	// Start the service with the WithoutNats option.
	service, err := StartService()
	if err != nil {
		// Handle the error.
		panic(err)
	}

	_, err = service.Nc.Subscribe(service.ServiceName+"-inbox", func(msg *nats.Msg) {
		// Handle the message.
	})
	if err != nil {
		panic(err)
	}

	// Wait until the user interrupts the service.
	WaitForInterrupt()
	// Drain the service, publishing any remaining messages.
	service.Drain()
}

// Start a Telestion service without the NATS connection.
func ExampleWithoutNats() {
	// Start the service without NATS.
	service, err := StartService(WithoutNats())
	if err != nil {
		// Handle the error.
		panic(err)
	}

	if service.HasNatsAPI() {
		panic("NATS API should not be available.")
	}
}
