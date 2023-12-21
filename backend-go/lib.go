package main

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

var Config TelestionBaseConfig

type TelestionError struct {
	Error   *error // only present if the TelestionError is based on an error
	Message string
	Code    int // might be interesting later if we want to identify where the error is coming from
}

func (t *TelestionError) FormatError() string {
	return fmt.Sprint(
		"An unexpected error (code: ",
		t.Code,
		") occurred in the Telestion backend library: \"",
		t.Message,
		"\"")
}

func NewTelestionError(err error, msg string) *TelestionError {
	return &TelestionError{&err, msg, 1}
}

// Config parsing process must at least yield the following minimal config scheme
type minimalConfig struct {
	Nats        bool   `json:"NATS"`
	NatsUrl     string `json:"NATS_URL"`
	ServiceName string `json:"SERVICE_NAME"`
	DataDir     string `json:"DATA_DIR"`
}

func inferMinimalConfig(mapping map[string]any) (*minimalConfig, *TelestionError) {
	mConf := minimalConfig{}

	decoderConfig := &mapstructure.DecoderConfig{
		ErrorUnused: false,
		ErrorUnset:  true,
		Result:      &mConf,
	}
	mDecoder, err := mapstructure.NewDecoder(decoderConfig)
	if err != nil {
		return nil, NewTelestionError(err, "Decoder for minimal config inference could not be initialized!")
	}

	if err := mDecoder.Decode(mapping); err != nil {
		return nil, NewTelestionError(err, "Minimal config could not be inferred from given map!")
	}

	return &mConf, nil
}

// Type of config that is returned after parsing
type TelestionBaseConfig struct {
	Dev         bool     `json:"DEV"`
	Nats        bool     `json:"NATS"`
	NatsUrl     string   `json:"NATS_URL"`
	NatsUsr     string   `json:"NATS_USER"`
	NatsPwd     string   `json:"NATS_PASSWORD"`
	ConfigFile  string   `json:"CONFIG_FILE"`
	ConfigKey   string   `json:"CONFIG_KEY"`
	ServiceName string   `json:"SERVICE_NAME"`
	DataDir     string   `json:"DATA_DIR"`
	NonFlagArgs []string `json:"NON_FLAG_ARGS"`

	CustomConfig map[string]any `json:"-" ,mapstructure:",remain"`
}

func inferTelestionConfig(mapping map[string]any) (*TelestionBaseConfig, *TelestionError) {
	tConfig := TelestionBaseConfig{}

	decoderConfig := &mapstructure.DecoderConfig{
		ErrorUnused:      false,
		ErrorUnset:       false,
		WeaklyTypedInput: true,
		Result:           tConfig,
	}

	tDecoder, err := mapstructure.NewDecoder(decoderConfig)
	if err != nil {
		return nil, NewTelestionError(err, "Decoder for TelestionBaseConfig inference could not be initialized!")
	}

	if err := tDecoder.Decode(mapping); err != nil {
		return nil, NewTelestionError(err, "TelestionBaseConfig could not be inferred from given map!")
	}

	return &tConfig, nil
}

func StartService() (*nats.Conn, *TelestionError) {
	// Ensure the config contains the minimum required fields
	configMapping := loadConfig()
	if _, err := inferMinimalConfig(configMapping); err != nil {
		return nil, err
	}

	// Parse config into usable data format
	cfgP, err := inferTelestionConfig(configMapping)
	Config = *cfgP
	if err != nil {
		return nil, err
	}

	// Init NATS
	if Config.Nats {
		return initializeNats()
	} else {
		return nil, NewTelestionError(nil,
			"Initializing a telestion service without NATS is currently not possible! "+
				"To continue set the corresponding NATS flag to true again.")
	}
}

func loadConfig() map[string]any {
	config := map[string]any{
		"CONFIG_FILE": nil,
		"CONFIG_KEY":  nil,
	}
	updateConfig(config, parseConsoleArguments())
	populateConfig(config, getEnvs())
	if _, contained := config["DEV"]; !contained {
		config["DEV"] = false
	}

	populateConfig(config, getDefaultConfig(config["DEV"].(bool)))
	populateConfig(config, getFileConfig(config))
	return config
}

func updateConfig[V any | string](config map[string]any, updates map[string]V) {
	for k, v := range updates {
		config[k] = v
	}
}

func populateConfig[V any | string](config map[string]any, updates map[string]V) {
	for k, v := range updates {
		// check if key is already in map and populate if it isn't
		if _, contained := config[k]; !contained {
			config[k] = v
		}
	}
}

func getFileConfig(config map[string]any) map[string]any {
	// Note that the file config is supposed to be a json config!
	jsonConfig := map[string]any{}

	configPath := config["CONFIG_FILE"].(string)
	if len(configPath) == 0 {
		return jsonConfig
	}

	jsonConfigBytes, err := os.ReadFile(configPath)

	if err != nil {
		log.Printf("Config file %s could not be read: %s\n", configPath, err)
		return jsonConfig
	}

	err = json.Unmarshal(jsonConfigBytes, &jsonConfig)
	if err != nil {
		log.Printf("Config file %s could not be parsed: %s\n", configPath, err)
		return jsonConfig
	}

	return jsonConfig
}

func getDefaultConfig(devFlag bool) map[string]string {
	if !devFlag {
		return map[string]string{
			"NATS": "true", // at the moment only nats is supported
		}
	}

	log.Println("Running in development mode. Using default values for missing environment variables.")
	return map[string]string{
		"NATS":         "true", // at the moment only nats is supported
		"NATS_URL":     nats.DefaultURL,
		"SERVICE_NAME": fmt.Sprint("dev-", os.Getgid()),
		"DATA_DIR":     filepath.Join(".", "data"), // we use filepath here to get the correct separator
	}
}

func getEnvs() map[string]string {
	envs := map[string]string{}
	for _, entry := range os.Environ() {
		split := strings.Split(entry, "=")
		key, val := split[0], split[1]

		// we don't want to overwrite config entries with empty environment variables!
		if len(val) == 0 {
			continue
		}

		envs[key] = val
	}
	return envs
}

func parseConsoleArguments() map[string]any {
	// setup flags
	var (
		devFlag  bool
		natsFlag bool

		natsUrlFlag  string
		natsUserFlag string
		natsPwdFlag  string

		configFileFlag string
		configKeyFlag  string

		serviceNameFlag string
		dataDirFlag     string
	)

	warnDescription := "(Note: It is recommended to set this via the environment variables or the config!)"

	flag.BoolVar(&devFlag, "development mode", false, "If set, program will start in development mode")
	flag.BoolVar(&natsFlag, "use NATS", true, "If set, service will use NATS as the messaging bus (default)")

	flag.StringVar(&natsUrlFlag, "NATS url", "", "NATS url of the server the service can connect to")
	flag.StringVar(&natsUserFlag, "NATS user", "", "NATS user name for the authentication with the server")
	flag.StringVar(&natsPwdFlag, "NATS password", "", "NATS password for the authentication with the server "+
		warnDescription)

	flag.StringVar(&configFileFlag, "config file path", "", "file path to the config of the service")
	flag.StringVar(&configKeyFlag, "config file password", "", "password of the config file "+
		warnDescription)

	flag.StringVar(&serviceNameFlag, "service name", "", "")
	flag.StringVar(&dataDirFlag, "data directory path", "", "")

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
	}

	/// populate parsedArgs with entries that were indeed given
	for k, v := range map[string]any{
		"DEV":           devFlag,
		"NATS":          natsFlag,
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

	return parsedArgs
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

func initializeNats() (*nats.Conn, *TelestionError) {
	var userInfo nats.Option = nil
	if len(Config.NatsUsr) != 0 && len(Config.NatsPwd) != 0 {
		userInfo = nats.UserInfo(Config.NatsUsr, Config.NatsPwd)
	}

	nc, err := nats.Connect(Config.NatsUrl, userInfo)

	if err != nil {
		return nil, NewTelestionError(err, fmt.Sprintf("Nats client could not be connected for %s!",
			Config.ServiceName))
	}

	// Register health check
	message := fmt.Sprintf(`{"name":"%s"}`, Config.ServiceName) // set here for not needing to reevaluate each time
	_, err = nc.Subscribe("__telestion__.health", func(m *nats.Msg) {
		err := m.Respond([]byte(message))
		if err != nil {
			// TODO: is Panicln better here?
			log.Println("Health message message of ", Config.ServiceName, " could not be sent!")
		}
	})

	if err != nil {
		return nil, NewTelestionError(err,
			fmt.Sprintf("__telestion__.health message could not be registered for %s!", Config.ServiceName))
	}

	return nc, nil
}
