Feature: Service Configuration

  Scenario: Services can be configured through environment variables
  The most common way to configure services is through environment variables.
  Environment variables are easy to use and can be set in a variety of ways.
  They are also easy to overwrite when running services locally.

    Given I have the basic service configuration
    And I have an environment variable named "TEST" with value "1"
    When I start the service without NATS
    Then the service should be configured with "TEST" set to "1"

  Scenario: Services can be configured through CLI arguments
  Sometimes it is useful to configure services through CLI arguments.
  CLI arguments are easy to use and can be set when running services locally.

    Given I have the basic service configuration
    When I start the service with "--TEST=1" without NATS
    Then the service should be configured with "TEST" set to "1"

  Scenario: Trying to run services without providing the required configuration fails
  There are some configuration values that are required for services to run.
  If these values are not provided, the service should fail to start.
  - `NATS_URL` - to connect to NATS
  - `SERVICE_NAME` - to group services in NATS when subscribing with multiple instances
  - `DATA_DIR` - a directory where the service is free to store persistent data

  During development, it is possible to use the development mode so you don't have to provide these values. However, this is not recommended for production.
    Given I have no service configuration
    When I start the service
    Then the service should fail to start

  Scenario: CLI arguments overwrite environment variables
  To make it easy to overwrite configuration values when running services locally, CLI arguments should overwrite environment variables.

    Given I have the basic service configuration
    And I have an environment variable named "TEST" with value "1"
    When I start the service with "--TEST=2" without NATS
    Then the service should be configured with "TEST" set to "2"
