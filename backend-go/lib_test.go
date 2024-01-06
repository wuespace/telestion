package telestion

import (
	"github.com/cucumber/godog"
	"testing"
)

func iHaveANATSServerRunningOn(arg1 string) error {
	return godog.ErrPending
}

func iHaveAnEnvironmentVariableNamedWithValue(arg1, arg2 string) error {
	return godog.ErrPending
}

func iHaveNoServiceConfiguration() error {
	return godog.ErrPending
}

func iHaveTheBasicServiceConfiguration() error {
	return godog.ErrPending
}

func iStartTheService() error {
	return godog.ErrPending
}

func iStartTheServiceWith(arg1 string) error {
	return godog.ErrPending
}

func iStartTheServiceWithWithoutNATS(arg1 string) error {
	return godog.ErrPending
}

func iStartTheServiceWithoutNATS() error {
	return godog.ErrPending
}

func isANATSUserWithPassword(arg1, arg2 string) error {
	return godog.ErrPending
}

func theNATSConnectionAPIShouldBeAvailableToTheService() error {
	return godog.ErrPending
}

func theNATSServerIsOffline() error {
	return godog.ErrPending
}

func theNATSServerRequiresAuthentication() error {
	return godog.ErrPending
}

func theServiceShouldBeConfiguredWithSetTo(arg1, arg2 string) error {
	return godog.ErrPending
}

func theServiceShouldConnectToNATS() error {
	return godog.ErrPending
}

func theServiceShouldFailToStart() error {
	return godog.ErrPending
}

func theServiceShouldNotConnectToNATS() error {
	return godog.ErrPending
}

func theServiceShouldStart() error {
	return godog.ErrPending
}

func InitializeScenario(ctx *godog.ScenarioContext) {
	ctx.Step(`^I have a NATS server running on "([^"]*)"$`, iHaveANATSServerRunningOn)
	ctx.Step(`^I have an environment variable named "([^"]*)" with value "([^"]*)"$`, iHaveAnEnvironmentVariableNamedWithValue)
	ctx.Step(`^I have no service configuration$`, iHaveNoServiceConfiguration)
	ctx.Step(`^I have the basic service configuration$`, iHaveTheBasicServiceConfiguration)
	ctx.Step(`^I start the service$`, iStartTheService)
	ctx.Step(`^I start the service with "([^"]*)"$`, iStartTheServiceWith)
	ctx.Step(`^I start the service with "([^"]*)" without NATS$`, iStartTheServiceWithWithoutNATS)
	ctx.Step(`^I start the service without NATS$`, iStartTheServiceWithoutNATS)
	ctx.Step(`^"([^"]*)" is a NATS user with password "([^"]*)"$`, isANATSUserWithPassword)
	ctx.Step(`^the NATS connection API should be available to the service$`, theNATSConnectionAPIShouldBeAvailableToTheService)
	ctx.Step(`^the NATS server is offline$`, theNATSServerIsOffline)
	ctx.Step(`^the NATS server requires authentication$`, theNATSServerRequiresAuthentication)
	ctx.Step(`^the service should be configured with "([^"]*)" set to "([^"]*)"$`, theServiceShouldBeConfiguredWithSetTo)
	ctx.Step(`^the service should connect to NATS$`, theServiceShouldConnectToNATS)
	ctx.Step(`^the service should fail to start$`, theServiceShouldFailToStart)
	ctx.Step(`^the service should not connect to NATS$`, theServiceShouldNotConnectToNATS)
	ctx.Step(`^the service should start$`, theServiceShouldStart)
}

func TestFeatures(t *testing.T) {
	suite := godog.TestSuite{
		ScenarioInitializer: InitializeScenario,
		Options: &godog.Options{
			Format:   "pretty",
			Paths:    []string{"../backend-features"},
			TestingT: t, // Testing instance that will run subtests.
		},
	}

	if suite.Run() != 0 {
		t.Fatal("non-zero status returned, failed to run feature tests")
	}
}
