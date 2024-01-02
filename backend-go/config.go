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

func assembleConfig() (*Config, error) {
	config := &map[string]any{}
	mergeMap(config, consoleArgs())
	//log.Printf("After console args: %+v", config)
	mergeMap(config, envs())
	//log.Printf("After env: %+v", config)

	if dev, ok := (*config)["DEV"].(bool); ok && dev {
		dc, err := defaultConfig()
		if err != nil {
			return nil, err
		}
		mergeMap(config, dc)
	}
	//log.Printf("After default config: %+v", config)

	if configPath, ok := (*config)["CONFIG_FILE"].(string); ok && len(configPath) != 0 {
		fc, err := fileConfig(configPath)
		if err != nil {
			return nil, err
		}
		mergeMap(config, fc)
	}
	//log.Printf("After file config: %+v", config)

	if err := checkMinimalConfig(*config); err != nil {
		return nil, err
	}

	return parseConfig(config)
}

func mergeMap[V any | string](config *map[string]any, updates *map[string]V) {
	for k, v := range *updates {
		if _, contained := (*config)[k]; !contained {
			(*config)[k] = v
		}
	}
}

func consoleArgs() *map[string]any {
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

func envs() *map[string]string {
	result := make(map[string]string, len(os.Environ()))
	for _, entry := range os.Environ() {
		if key, value, ok := strings.Cut(entry, "="); ok {
			result[key] = value
		}
		// we don't want to add empty env variables
	}
	return &result
}

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
