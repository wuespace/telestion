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
func assertContainsMinimalConfig(mapping map[string]any) error {
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
		return fmt.Errorf("missing parameters in configuration. "+
			"The following parameters are required: NATS_URL, SERVICE_NAME, DATA_DIR. "+
			"Consider using --dev during development. Original error message: %s", err.Error())
	}

	return nil
}

// Parses an untyped map into a service configuration.
func parseConfig(mapping *map[string]any) (*Config, error) {
	// gets populated by the mapstructure decoder
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
	updateWith(config, &overwriteArgs)
	// add config params from command line arguments
	updateWith(config, cliConfig())
	// add config params from environment variables
	updateWith(config, envConfig())

	// add default config if "dev" configuration is defined
	if dev, ok := (*config)["DEV"].(bool); ok && dev {
		fmt.Println("Running in development mode. Using default values for missing environment variables.")
		dc, err := devModeDefaultConfig()
		if err != nil {
			return nil, err
		}
		updateWith(config, dc)
	}

	// add config file parameters if "CONFIG_FILE" is defined and readable
	if configPath, ok := (*config)["CONFIG_FILE"].(string); ok && len(configPath) != 0 {
		fc, err := fileConfig(configPath)
		if err != nil {
			return nil, err
		}
		updateWith(config, fc)
	}

	// verify if configuration is valid
	if err := assertContainsMinimalConfig(*config); err != nil {
		return nil, err
	}

	return parseConfig(config)
}

// Adds entries from updates to base that don't exist in base.
func updateWith[V any | string](base *map[string]any, updates *map[string]V) {
	for k, v := range *updates {
		if _, contained := (*base)[k]; !contained {
			(*base)[k] = v
		}
	}
}

// Parses the console arguments and returns a map that holds the configuration parameters.
func cliConfig() *map[string]any {
	// setup flags
	var (
		dev          bool
		natsUrl      string
		natsUser     string
		natsPassword string
		configFile   string
		configKey    string
		serviceName  string
		dataDir      string
	)

	flag.BoolVar(&dev, "dev", false, "If set, program will start in development mode")

	flag.StringVar(&natsUrl, "NATS_URL", "", "NATS url of the server the service can connect to")
	flag.StringVar(&natsUser, "NATS_USER", "", "NATS user name for the authentication with the server")
	flag.StringVar(&natsPassword, "NATS_PASSWORD", "", "NATS password for the authentication with the server "+
		"(Note: It is recommended to set this via the environment variables or the config!)")

	flag.StringVar(&configFile, "CONFIG_FILE", "", "file path to the config of the service")
	flag.StringVar(&configKey, "CONFIG_KEY", "", "object key of a config file")

	flag.StringVar(&serviceName, "SERVICE_NAME", "", "name of the service also used in the nats service "+
		"registration")
	flag.StringVar(&dataDir, "DATA_DIR", "", "path where the service can store persistent data")

	// we don't really like the default message of the flag package
	flag.Usage = func() {
		fmt.Printf("Usage: %s [options] [field_0 ... field_n]\n\nParameters:\n", os.Args[0])
		flag.PrintDefaults()
	}
	flag.Parse()

	flagValues := map[string]any{
		"NATS_URL":      natsUrl,
		"NATS_USER":     natsUser,
		"NATS_PASSWORD": natsPassword,
		"CONFIG_FILE":   configFile,
		"CONFIG_KEY":    configKey,
		"SERVICE_NAME":  serviceName,
		"DATA_DIR":      dataDir,
	}

	// prepare output map
	parsedArgs := map[string]any{
		"DEV": dev,
	}

	// only populate parsedArgs with entries that were, indeed, given (dev is an exception)
	flag.Visit(func(currentFlag *flag.Flag) {
		if value, ok := flagValues[currentFlag.Name]; ok {
			parsedArgs[currentFlag.Name] = value
		}
	})

	return &parsedArgs
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
func devModeDefaultConfig() (*map[string]string, error) {
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
