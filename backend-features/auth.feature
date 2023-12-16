Feature: NATS authentication

	Scenario: Starting the service with valid credentials
		Given I have the basic service configuration
		And I have a NATS server running on "localhost:4222"
		And the NATS server requires authentication
		And "nats" is a NATS user with password "password"
		And I have an environment variable named "NATS_URL" with value "localhost:4222"
		And I have an environment variable named "NATS_USER" with value "nats"
		And I have an environment variable named "NATS_PASSWORD" with value "password"
		When I start the service
		Then the service should start
		And the service should connect to NATS

	Scenario: Starting the service with invalid credentials fails
		Given I have the basic service configuration
		And I have a NATS server running on "localhost:4222"
		And the NATS server requires authentication
		And "nats" is a NATS user with password "password"
		And I have an environment variable named "NATS_URL" with value "localhost:4222"
		And I have an environment variable named "NATS_USER" with value "nats"
		And I have an environment variable named "NATS_PASSWORD" with value "wrong"
		Then the service should fail to start

	Scenario: Starting the service without credentials fails when the NATS server requires authentication
		Given I have the basic service configuration
		And I have a NATS server running on "localhost:4222"
		And the NATS server requires authentication
		And "nats" is a NATS user with password "password"
		And I have an environment variable named "NATS_URL" with value "localhost:4222"
		Then the service should fail to start

	Scenario: Starting the service fails when the NATS server is offline
		Given I have the basic service configuration
		And I have a NATS server running on "localhost:4222"
		And the NATS server requires authentication
		And "nats" is a NATS user with password "password"
		And I have an environment variable named "NATS_URL" with value "localhost:4222"
		And I have an environment variable named "NATS_USER" with value "nats"
		And I have an environment variable named "NATS_PASSWORD" with value "password"
		And the NATS server is offline
		Then the service should fail to start