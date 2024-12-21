package telestion

// Run the Service until an interrupt signal is received.
func ExampleWaitForInterrupt() {
	service, _ := StartService()

	// [...]

	WaitForInterrupt()
	println("Interrupted, exiting...")
	service.Drain()
}
