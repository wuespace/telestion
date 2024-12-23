Feature: Development mode

  Scenario: The service can be started in dev mode to use default parameters during development
  During development, it is useful to start the service with default parameters, so that it can be used without any configuration.

    Given I have no service configuration
    When I start the service with "--dev" without NATS
    Then the service should start
    And the service should be configured with "NATS_URL" set to either "localhost:4222" or "nats://localhost:4222"
    And the service should be configured with "NATS_USER" set to "undefined"
    And the service should be configured with "NATS_PASSWORD" set to "undefined"

  Scenario: Any custom configuration overwrites dev mode parameters
    Given I have no service configuration
    And I have a NATS server running on "nats:4255"
    And I have an environment variable named "NATS_URL" with value "nats:4255"
    When I start the service with "--dev --DATA_DIR=/tmp"
    Then the service should start
    And the service should connect to NATS
    And the service should be configured with "DATA_DIR" set to "/tmp"
    And the service should be configured with "NATS_URL" set to either "nats:4255" or "nats://nats:4255"
