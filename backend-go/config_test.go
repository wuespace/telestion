package telestion

import (
	"fmt"
	"maps"
	"slices"
)

// Use MergeMaps to merge two maps, and print the result to stdout.
func ExampleMergeMaps() {
	map1 := map[string]any{
		"key1": "value1",
		"key2": "value2",
	}
	map2 := map[string]any{
		"key3": "value3",
		"key4": "value4",
	}
	map3 := map[string]any{
		"key1": "value1 modified",
		"key3": "value3 modified",
	}

	merged := MergeMaps(map1, map2, map3)

	for _, key := range slices.Sorted(maps.Keys(merged)) {
		fmt.Printf("Merged key '%s' with value '%s'\n", key, merged[key])
	}
	// Output:
	// Merged key 'key1' with value 'value1 modified'
	// Merged key 'key2' with value 'value2'
	// Merged key 'key3' with value 'value3 modified'
	// Merged key 'key4' with value 'value4'
}

// Use CliArgsMap to get a map of all CLI arguments, and print them to stdout.
func ExampleCliArgsMap() {
	CliArgs := CliArgsMap()

	for key, value := range CliArgs {
		fmt.Printf("CLI argument '%s' with value '%s'\n", key, value)
	}
}

// Use EnvArgsMap to get a map of all environment variables, and print them to stdout.
func ExampleEnvArgsMap() {
	EnvArgs := EnvArgsMap()

	for key, value := range EnvArgs {
		fmt.Printf("Environment variable '%s' with value '%s'\n", key, value)
	}
}
