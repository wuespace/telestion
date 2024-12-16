Feature: Service Lifecycle

  Scenario: Starting a service
  The most trivial scenario of them all. We start the service and it should start. That's it. No more, no less. But it's a good start.

    Given I have the basic service configuration
    And I have a NATS server running on "nats:4222"
    When I start the service
    Then the service should start
