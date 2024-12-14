package telestion

import "github.com/nats-io/nats.go"

type Service struct {
	Nc           *nats.Conn
	Config       map[string]any
	DataDir      string
	ServiceName  string
	NatsDisabled bool
}

// Drain tries to drain any NATS connections of the service.
func (service Service) Drain() {
	if service.Nc != nil {
		err := service.Nc.Drain()
		if err != nil {
			panic(err)
		}
	}
}

// IsConnected returns true if the service is connected to the NATS server.
func (service Service) IsConnected() bool {
	if service.Nc != nil {
		return service.Nc.IsConnected()
	}
	return false
}

// HasNatsAPI returns true if the service has a NATS API available.
func (service Service) HasNatsAPI() bool {
	return service.Nc != nil
}

// ServiceOption is a function that modifies a service.
// It returns an error if the modification fails.
// Can be used to pass various options to StartService.
type ServiceOption func(*Service) error
