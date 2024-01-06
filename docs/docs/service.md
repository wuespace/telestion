# Services

Services are small, self-contained, and (ideally) stateless applications that can be deployed and scaled independently. They're designed to be used in conjunction with other services and are often packaged together to form a larger application.

**In less abstract terms,** a service is a single application that is part of the bigger Telestion application. It is a single application that is responsible for a single task. For example, the project template contains the following services by default:

* Frontend: A web application that is responsible for displaying the user interface
* Database Service: A service that is responsible for storing data
* Database Query Service: A service that is responsible for querying the database
* Data Splitter Service: A service that is responsible for creating mock data to test the application

## Service Types

There are two types of services:

* Frontend Services: Services that are responsible for displaying the user interface
* Backend Services: Services that are responsible for processing data

!!! info
	Concretely, the main difference between frontend and backend is that frontend services act on behalf of the user, while backend services act on behalf of the system.

## Service Architecture

While similar to the common microservice architecture, Telestion is less strict about its services. For example, Telestion services are not required to be stateless. While state in services makes it harder to scale them, it also makes it easier to develop them.

Telestion services are also not required to be deployed independently. They can be deployed together as a single application.

## Service Communication

Telestion services communicate via the [NATS message bus](message-bus.md). This means that they can send messages to each other and receive messages from each other. This allows them to communicate with each other without having to know each other's IP addresses or ports.
