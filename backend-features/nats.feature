Feature: NATS Integration in Services

  Scenario: The service has access to the NATS client after startup
  The service should be able to access the NATS client after startup. This enables service developers to use the NATS client to publish and subscribe to messages.

    Given I have the basic service configuration
    And I have a NATS server running on "nats:4222"
    When I start the service
    Then the service should connect to NATS
    And the NATS connection API should be available to the service

  Scenario: The developer disables the NATS integration
  The developer may want to disable the NATS integration for testing purposes or because the service does not need NATS.

    Given I have the basic service configuration
    And I have a NATS server running on "nats:4222"
    When I start the service without NATS
    Then the service should not connect to NATS
