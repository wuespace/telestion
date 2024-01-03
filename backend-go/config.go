package telestion

import (
	"encoding/json"
	"flag"
	"fmt"
	"github.com/mitchellh/mapstructure"
	"github.com/nats-io/nats.go"
	"log"
	"os"
	"path/filepath"
	"strings"
)

// Config parsing process must at least yield the following minimal config scheme
type minimalConfig struct {
	NatsUrl     string `mapstructure:"NATS_URL"`
	ServiceName string `mapstructure:"SERVICE_NAME"`
	DataDir     string `mapstructure:"DATA_DIR"`
}

// Checks if the untyped map contains all required config parameters to successfully start the service.
func checkMinimalConfig(mapping map[string]any) error {
	mConf := minimalConfig{}

	decoderConfig := &mapstructure.DecoderConfig{
		ErrorUnused: false,
		ErrorUnset:  true,
		Result:      &mConf,
	}

	decoder, err := mapstructure.NewDecoder(decoderConfig)
	if err != nil {
		// Decoder for minimal config inference could not be initialized!
		return err
	}

	if err := decoder.Decode(mapping); err != nil {
		// Minimal config could not be inferred from given map!
		return err
	}

	return nil
}

// Parses an untyped map into a service configuration.
func parseConfig(mapping *map[string]any) (*Config, error) {
	config := Config{}

	decoderConfig := &mapstructure.DecoderConfig{
		ErrorUnused:      false,
		ErrorUnset:       false,
		WeaklyTypedInput: true,
		Result:           &config,
	}

	decoder, err := mapstructure.NewDecoder(decoderConfig)
	if err != nil {
		// Decoder for TelestionBaseConfig inference could not be initialized!
		return nil, err
	}

	if err := decoder.Decode(*mapping); err != nil {
		// TelestionBaseConfig could not be inferred from given map!
		return nil, err
	}

	return &config, nil
}

// Loads and parses the service [Config] from different configuration sources in the following order:
//
// 1. `overwriteArgs`
// 2. command line arguments
// 3. environment variables
// 4. default configuration, if `--dev` is passed in the steps from above
// 5. configuration file, if `CONFIG_FILE` parameter is defined, readable and parsable
func assembleConfig(overwriteArgs map[string]string) (*Config, error) {
	config := &map[string]any{}

	// add config params from passed service options
	addMissing(config, &overwriteArgs)
	// add config params from command line arguments
	addMissing(config, cliConfig())
	// add config params from environment variables
	addMissing(config, envConfig())

	// add default config if "dev" configuration is defined
	if dev, ok := (*config)["DEV"].(bool); ok && dev {
		dc, err := defaultConfig()
		if err != nil {
			return nil, err
		}
		addMissing(config, dc)
	}

	// add config file parameters if "CONFIG_FILE" is defined and readable
	if configPath, ok := (*config)["CONFIG_FILE"].(string); ok && len(configPath) != 0 {
		fc, err := fileConfig(configPath)
		if err != nil {
			return nil, err
		}
		addMissing(config, fc)
	}

	// verify if configuration is valid
	if err := checkMinimalConfig(*config); err != nil {
		return nil, err
	}

	return parseConfig(config)
}

// Adds entries from updates to mapping that don't exist in mapping.
func addMissing[V any | string](mapping *map[string]any, updates *map[string]V) {
	for k, v := range *updates {
		if _, contained := (*mapping)[k]; !contained {
			(*mapping)[k] = v
		}
	}
}

// Parses the console arguments and returns a map that holds the configuration parameters.
func cliConfig() *map[string]any {
	// setup flags
	var (
		devFlag bool

		natsUrlFlag  string
		natsUserFlag string
		natsPwdFlag  string

		configFileFlag string
		configKeyFlag  string

		serviceNameFlag string
		dataDirFlag     string
	)

	flag.BoolVar(&devFlag, "dev", false, "If set, program will start in development mode")

	flag.StringVar(&natsUrlFlag, "NATS_URL", "", "NATS url of the server the service can connect to")
	flag.StringVar(&natsUserFlag, "NATS_USER", "", "NATS user name for the authentication with the server")
	flag.StringVar(&natsPwdFlag, "NATS_PASSWORD", "", "NATS password for the authentication with the server "+
		"(Note: It is recommended to set this via the environment variables or the config!)")

	flag.StringVar(&configFileFlag, "CONFIG_FILE", "", "file path to the config of the service")
	flag.StringVar(&configKeyFlag, "CONFIG_KEY", "", "object key of a config file")

	flag.StringVar(&serviceNameFlag, "SERVICE_NAME", "", "name of the service also used in the nats service "+
		"registration")
	flag.StringVar(&dataDirFlag, "DATA_DIR", "", "path where the service can store persistent data")

	// we don't really like the default message of the flag package
	flag.Usage = func() {
		fmt.Printf("Usage: %s [options] [field_0 ... field_n]\n\nParameters:\n", os.Args[0])
		flag.PrintDefaults()
	}
	flag.Parse()

	// additional arguments that can be used by other parts of the service (although they should register flags
	// themselves before calling the initialize method if possible! -> makes parsing a lot easier + only one behaviour
	// can be mimicked by multiple non-flag arguments)
	otherArgs := flag.Args()

	// prepare output map
	parsedArgs := map[string]any{
		"NON_FLAG_ARGS": otherArgs,
		"DEV":           devFlag,
	}

	// only populate parsedArgs with entries that were, indeed, given (dev is an exception)
	for k, v := range map[string]any{
		"NATS_URL":      natsUrlFlag,
		"NATS_USER":     natsUserFlag,
		"NATS_PASSWORD": natsPwdFlag,
		"CONFIG_FILE":   configFileFlag,
		"CONFIG_KEY":    configKeyFlag,
		"SERVICE_NAME":  serviceNameFlag,
		"DATA_DIR":      dataDirFlag,
	} {
		if isFlagPassed(k) {
			parsedArgs[k] = v
		}
	}

	return &parsedArgs
}

func isFlagPassed(name string) bool {
	passed := false
	flag.Visit(func(f *flag.Flag) {
		if f.Name == name {
			passed = true
		}
	})
	return passed
}

// Read the environment variables and provides them as map ready to be included in the service config.
func envConfig() *map[string]string {
	result := make(map[string]string, len(os.Environ()))
	for _, entry := range os.Environ() {
		if key, value, ok := strings.Cut(entry, "="); ok {
			result[key] = value
		}
		// we don't want to add empty env variables
	}
	return &result
}

// Tries to read the configuration file and returns the content as untyped map.
// Fails, if the config file is not readable or if the content is not JSON parsable.
func fileConfig(configPath string) (*map[string]any, error) {
	// Note that the file config is supposed to be a json config
	jsonConfig := map[string]any{}
	jsonConfigBytes, err := os.ReadFile(configPath)

	if err != nil {
		log.Printf("Config file %s could not be read: %s\n", configPath, err)
		return nil, err
	}

	if err = json.Unmarshal(jsonConfigBytes, &jsonConfig); err != nil {
		log.Printf("Config file %s could not be parsed: %s\n", configPath, err)
		return nil, err
	}

	return &jsonConfig, nil
}

// Returns the default configuration for development purposes.
// Fails, if the process is not allowed to determine the current working directory.
func defaultConfig() (*map[string]string, error) {
	dataDir, err := filepath.Abs("data")
	if err != nil {
		return nil, err
	}

	return &map[string]string{
		"NATS_URL":     nats.DefaultURL,
		"SERVICE_NAME": fmt.Sprint("dev-", os.Getgid()),
		"DATA_DIR":     dataDir,
	}, nil
}
