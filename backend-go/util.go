package telestion

import (
	"os"
	"os/signal"
)

// WaitForInterrupt blocks the execution of the current goroutine.
// It waits for a process interrupt and returns the detected signal to the caller.
func WaitForInterrupt() os.Signal {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	return <-c
}

// GetStringOrDefault returns the value associated with the key in the map if it exists and is a string,
// otherwise returns the default value.
func GetStringOrDefault(m map[string]any, key string, defaultValue string) string {
	if value, ok := m[key]; ok {
		if strValue, isString := value.(string); isString {
			return strValue
		}
	}
	return defaultValue
}
