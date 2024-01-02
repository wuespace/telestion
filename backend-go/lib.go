package telestion

import (
	"github.com/nats-io/nats.go"
	"path/filepath"
)

// Config that is configures the Telestion service
// The parsed configuration returned from the startService function for further usage.
type Config struct {
	Dev          bool     `mapstructure:"DEV"`
	Nats         bool     `mapstructure:"NATS"`
	NatsUrl      string   `mapstructure:"NATS_URL"`
	NatsUser     string   `mapstructure:"NATS_USER"`
	NatsPassword string   `mapstructure:"NATS_PASSWORD"`
	ConfigFile   string   `mapstructure:"CONFIG_FILE"`
	ConfigKey    string   `mapstructure:"CONFIG_KEY"`
	ServiceName  string   `mapstructure:"SERVICE_NAME"`
	DataDir      string   `mapstructure:"DATA_DIR"`
	NonFlagArgs  []string `mapstructure:"NON_FLAG_ARGS"`

	CustomConfig map[string]any `json:"-" ,mapstructure:",remain"`
}

type Service struct {
	Nc          *nats.Conn
	NcJson      *nats.EncodedConn
	IsNats      bool
	DataDir     string
	ServiceName string
	Config      *Config
}

func (service *Service) Drain() (error, error) {
	var errNcJson, errNc error = nil, nil
	if service.NcJson != nil {
		errNcJson = service.NcJson.Drain()
	}
	if service.Nc != nil {
		errNc = service.Nc.Drain()
	}

	return errNcJson, errNc
}

func (service *Service) Close() {
	if service.NcJson != nil {
		service.NcJson.Close()
	}
	if service.Nc != nil {
		service.Nc.Close()
	}
}

type Options struct {
	Nats bool
}

func StartService(options Options) (*Service, error) {
	config, err := assembleConfig()
	if err != nil {
		return nil, err
	}

	dataDir, err := filepath.Abs(config.DataDir)

	// set to nil if Nats is disabled
	// the user should check if `IsNats` is true
	var nc *nats.Conn = nil
	var ncJson *nats.EncodedConn = nil
	if options.Nats {
		nc, ncJson, err = initializeNats(config)
	}
	if err != nil {
		return nil, err
	}

	return &Service{
		Nc:          nc,
		NcJson:      ncJson,
		IsNats:      options.Nats,
		DataDir:     dataDir,
		ServiceName: config.ServiceName,
		Config:      config,
	}, nil
}
