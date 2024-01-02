package telestion

import (
	"encoding/json"
	"github.com/nats-io/nats.go"
)

func initializeNats(config *Config) (*nats.Conn, *nats.EncodedConn, error) {
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
