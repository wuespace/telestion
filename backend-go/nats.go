package telestion

import (
	"encoding/json"
	"errors"
	"github.com/nats-io/nats.go"
)

// Initialize the NATS connection and register the health check subscriber.
func initializeNats(config *Config, customNc *nats.Conn, customNcJson *nats.EncodedConn) (*nats.Conn, *nats.EncodedConn, error) {
	var (
		nc     *nats.Conn
		ncJson *nats.EncodedConn
		err    error
	)

	if customNc != nil {
		if customNcJson == nil {
			return nil, nil, errors.New("customNcJson is not defined but required if a customNc gets used (nc != nil && ncJson == nil)")
		}

		nc = customNc
		ncJson = customNcJson
	} else {
		nc, ncJson, err = connectNats(config)
		if err != nil {
			return nil, nil, err
		}
	}

	// setup health check
	_, _ = nc.Subscribe("__telestion__/health", func(msg *nats.Msg) {
		response, _ := json.Marshal(healthcheck{0, config.ServiceName})
		_ = msg.Respond(response)
	})

	return nc, ncJson, nil
}

type healthcheck struct {
	errors int
	name   string
}

// Connect to NATS server with the provided information from the service configuration.
func connectNats(config *Config) (*nats.Conn, *nats.EncodedConn, error) {
	var natsOption nats.Option = nil
	if len(config.NatsUser) != 0 && len(config.NatsPassword) != 0 {
		// use username/password authentication
		natsOption = nats.UserInfo(config.NatsUser, config.NatsPassword)
	}

	nc, err := nats.Connect(config.NatsUrl, natsOption)
	if err != nil {
		return nil, nil, err
	}
	ncJson, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		nc.Close()
		return nil, nil, err
	}

	return nc, ncJson, nil
}
