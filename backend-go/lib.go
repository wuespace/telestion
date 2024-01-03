// Package telestion provides a framework for building [Telestion] services in Go.
//
// [Telestion]: https://telestion.wuespace.de/
package telestion

import (
	"errors"
	"github.com/nats-io/nats.go"
	"path/filepath"
)

// Config configures the Telestion service.
// The parsed configuration returned from the startService function for further usage.
type Config struct {

	// Dev adds minimal required configuration parameters to the configuration object.
	Dev bool `mapstructure:"DEV"`

	// NatsUrl describes the url that NATS uses to connect to the NATS server.
	NatsUrl string `mapstructure:"NATS_URL"`

	// NatsUser is the username that the NATS client uses to log in on the NATS server.
	// This property can be undefined if no configuration source provided this parameter.
	NatsUser string `mapstructure:"NATS_USER"`

	// NatsPassword is the password that the NATS client uses to log in on the NATS server.
	// This property can be undefined if no configuration source provided this parameter.
	NatsPassword string `mapstructure:"NATS_PASSWORD"`

	// ConfigFile contains the path to the configuration file that [StartService] read during startup.
	// This property can be undefined if no configuration source provided this parameter.
	ConfigFile string `mapstructure:"CONFIG_FILE"`

	// ConfigKey describes a key in config file's root object that configures this service.
	// This property can be undefined if no configuration source provided this parameter.
	ConfigKey string `mapstructure:"CONFIG_KEY"`

	// ServiceName contains the name of the service.
	// This is used to create a unique queue group for the service.
	ServiceName string `mapstructure:"SERVICE_NAME"`

	// DataDir is the path to the data directory.
	// This is where the service should store any data it needs to persist.
	// The data is shared between multiple services.
	// To ensure that the service doesn't overwrite data from other services,
	// you should create a subdirectory for your service.
	DataDir string `mapstructure:"DATA_DIR"`

	// NonFlagArgs contain additional command line arguments that are passed after all flags.
	NonFlagArgs []string `mapstructure:"NON_FLAG_ARGS"`

	// CustomConfig contains unparsed configuration from all configuration sources.
	// To use these configuration parameter you need to type cast these to a suitable type.
	CustomConfig map[string]any `json:"-" ,mapstructure:",remain"`
}

// Options describes the different options [Option] can change to modify the startup behaviour of [StartService].
type Options struct {

	// Nats instructs [StartService] whether a NATS connection should be initialized.
	Nats bool

	// OverwriteArgs provide additional configuration parameters
	// that have precedence over any other configuration source.
	OverwriteArgs map[string]string

	// CustomNc is a NATS connection that is externally managed and passed to [StartService] during startup.
	// If `CustomNc != nil` [StartService] does not create another NATS connection
	// and uses the provided connection instead.
	CustomNc *nats.Conn

	// CustomNcJson is an abstraction of [Options.CustomNc].
	// It provides automatic JSON marshaling and unmarshalling of NATS message bodies.
	CustomNcJson *nats.EncodedConn
}

// Option takes the startup options from [StartService] and modifies the startup behaviour.
type Option func(*Options) error

// WithoutNats disables the NATS initialization step in [StartService].
func WithoutNats() Option {
	return func(options *Options) error {
		options.Nats = false
		return nil
	}
}

// WithOverwriteArgs passes additional configuration parameters to [StartService].
// These parameters have precedence over any other configuration source.
func WithOverwriteArgs(args map[string]string) Option {
	return func(options *Options) error {
		options.OverwriteArgs = args
		return nil
	}
}

// WithCustomNc gives [StartService] externally managed NATS connections.
// This option prevents [StartService] to initialize another NATS connection.
// Both arguments must be a valid NATS connection.
func WithCustomNc(nc *nats.Conn, ncJson *nats.EncodedConn) Option {
	return func(options *Options) error {
		if nc == nil {
			return errors.New("custom nats connection is not defined (nc == nil)")
		}
		if ncJson == nil {
			return errors.New("custom encoded nats connection is not defined (ncJson == nil)")
		}

		options.CustomNc = nc
		options.CustomNcJson = ncJson
		// enable usage of NATS to register health check
		options.Nats = true
		return nil
	}
}

// Service is a Telestion service that provides the available APIs.
type Service struct {

	// Nc is the NATS connection the service uses to communicate with other services on the NATS network.
	Nc *nats.Conn

	// NcJson is an abstraction of [Service.Nc]
	// that provides automatic JSON marshaling and unmarshalling of NATS message bodies.
	NcJson *nats.EncodedConn

	// DataDir is an absolute path to the data directory of the service.
	// This is where the service should store any data it needs to persist.
	// The data is shared between multiple services.
	// To ensure that the service doesn't overwrite data from other services,
	// you should create a subdirectory for your service.
	DataDir string

	// ServiceName is the name of the service.
	// This is used to create a unique queue group for the service.
	ServiceName string

	// Config is the assembled configuration from all available configuration sources.
	// It configures the service.
	Config *Config
}

// StartService starts a new Telestion service and returns the available APIs.
// Additional options passed are applied in the order in they appear and modify the startup procedure.
//
// During startup the service parses the service [Config] from different configuration sources in the following order:
//
//  1. `overwriteArgs` from [WithOverwriteArgs]
//  2. command line arguments
//  3. environment variables
//  4. default configuration, if `--dev` is passed in the steps from above
//  5. configuration file, if `CONFIG_FILE` parameter is defined, readable and parsable
func StartService(opts ...Option) (*Service, error) {
	options := Options{
		Nats:          true,
		OverwriteArgs: map[string]string{},
		CustomNc:      nil,
		CustomNcJson:  nil,
	}

	// run through each option modifier passing the current options
	for _, opt := range opts {
		if opt != nil {
			if err := opt(&options); err != nil {
				return nil, err
			}
		}
	}

	// load the service configuration
	config, err := assembleConfig(options.OverwriteArgs)
	if err != nil {
		return nil, err
	}

	// resolve data directory as absolute path
	dataDir, err := filepath.Abs(config.DataDir)
	if err != nil {
		return nil, err
	}

	// initialize NATS connections
	// explicitly set to nil if NATS is disabled
	var nc *nats.Conn = nil
	var ncJson *nats.EncodedConn = nil
	if options.Nats {
		nc, ncJson, err = initializeNats(config, options.CustomNc, options.CustomNcJson)
		if err != nil {
			// only close nats connections that aren't externally managed
			if options.CustomNc == nil && ncJson != nil {
				nc.Close()
			}
			if options.CustomNcJson == nil && nc != nil {
				ncJson.Close()
			}
			return nil, err
		}
	}

	return &Service{
		Nc:          nc,
		NcJson:      ncJson,
		DataDir:     dataDir,
		ServiceName: config.ServiceName,
		Config:      config,
	}, nil
}

// Drain tries to drain both NATS connection of the service.
func (service *Service) Drain() (errNcJson error, errNc error) {
	if service.NcJson != nil {
		errNcJson = service.NcJson.Drain()
	}
	if service.Nc != nil {
		errNc = service.Nc.Drain()
	}

	return
}

// Close closes both NATS connections of the service.
func (service *Service) Close() {
	if service.NcJson != nil {
		service.NcJson.Close()
	}
	if service.Nc != nil {
		service.Nc.Close()
	}
}
