package telestion

import (
	"fmt"
	"github.com/nats-io/nats.go"
)

// StartService starts the Telestion service with the given options.
// The service can be configured using functions implementing the ServiceOption interface.
// Examples for such functions are:
//   - WithoutNats.
//
// If the service cannot be started, an error is returned.
// Otherwise, a Service object including various APIs is returned.
func StartService(opts ...ServiceOption) (*Service, error) {
	service := &Service{
		Nc:           nil,
		Config:       nil,
		DataDir:      "",
		ServiceName:  "",
		NatsDisabled: false,
	}

	for _, opt := range opts {
		if err := opt(service); err != nil {
			return nil, err
		}
	}

	err := withServiceConfig(service)
	if err != nil {
		return nil, err
	}

	if service.NatsDisabled {
		return service, nil
	}

	// initialize NATS connections
	if service.Config["NATS_URL"] == nil {
		return nil, fmt.Errorf("no NATS_URL provided")
	}

	credentials := nats.UserInfo(
		GetStringOrDefault(service.Config, "NATS_USER", ""),
		GetStringOrDefault(service.Config, "NATS_PASSWORD", ""),
	)

	nc, err := nats.Connect(service.Config["NATS_URL"].(string), credentials)
	if err != nil {
		return nil, err
	}
	service.Nc = nc

	return service, nil
}

// WithoutNats returns a ServiceOption that modifies a service to run without connecting to NATS.
// This is useful for deploying local services with the Telestion infrastructure without having
// interactions with other services.
func WithoutNats() ServiceOption {
	return func(s *Service) error {
		s.NatsDisabled = true
		return nil
	}
}
