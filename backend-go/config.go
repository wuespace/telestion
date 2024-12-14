package telestion

import (
	"fmt"
	"os"
	"strings"
)

func withServiceConfig(service *Service) error {
	// First Pass
	service.Config = MergeMaps(EnvArgsMap(), CliArgsMap())

	// Dev Mode
	if service.Config["DEV"] == true {
		service.Config = MergeMaps(map[string]any{
			"DATA_DIR":     "/tmp",
			"SERVICE_NAME": "dev",
			"NATS_URL":     "localhost:4222",
		}, service.Config)
	}

	// Ensure Minimal Config
	if service.Config["DATA_DIR"] == nil {
		return fmt.Errorf("no DATA_DIR provided")
	}
	service.DataDir = service.Config["DATA_DIR"].(string)
	if service.Config["SERVICE_NAME"] == nil {
		return fmt.Errorf("no SERVICE_NAME provided")
	}
	service.ServiceName = service.Config["SERVICE_NAME"].(string)
	return nil
}

// Merges multiple maps into one.
// If a key is present in multiple maps, the value of the last map is used.
func MergeMaps(maps ...map[string]any) map[string]any {
	res := make(map[string]any)
	for _, m := range maps {
		for k, v := range m {
			res[k] = v
		}
	}
	return res
}

// Returns a map of all CLI arguments in the form of --KEY=VALUE or --KEY VALUE
// where KEY is the uppercase key and VALUE is the value.
// If the argument is a flag (i.e., does not have a value), the value is true.
// Positional arguments are ignored.
func CliArgsMap() map[string]any {
	res := make(map[string]any)
	for /* don't include executable ($0) => start at 1 */ i := 1; i < len(os.Args); i++ {
		key := os.Args[i]

		if !strings.HasPrefix(key, "--") {
			// ignore positional arguments
			continue
		}

		key = strings.TrimPrefix(key, "--")
		if strings.Contains(key, "=") {
			// --KEY=VALUE
			split := strings.Split(key, "=")
			innerKey := strings.ToUpper(split[0]) // all config keys are uppercase
			innerValue := strings.Join(split[1:], "=")
			res[innerKey] = innerValue
			continue
		}

		// --KEY (VALUE)
		// convert the key to uppercase as it doesn't contain the value in this case:
		key = strings.ToUpper(key)

		hasValue := i+1 < len(os.Args) &&
			!strings.HasPrefix(os.Args[i+1], "--")

		if hasValue {
			// it's a key-value pair
			res[key] = os.Args[i+1]
			i++
			continue
		}

		// it's a flag and not a key-value pair
		res[key] = true
	}
	return res
}

// Returns a map of all environment variables, where the key is the uppercase key
// and the value is the value of the environment variable.
//
// While this does always return a string, for compatibility with MergeMaps, it is
// typed as map[string]any.
func EnvArgsMap() map[string]any {
	res := make(map[string]any)
	for _, env := range os.Environ() {
		split := strings.Split(env, "=")
		key := strings.ToUpper(split[0]) // all config keys are uppercase
		value := strings.Join(split[1:], "=")
		res[key] = value
	}
	return res
}
