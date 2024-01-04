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
