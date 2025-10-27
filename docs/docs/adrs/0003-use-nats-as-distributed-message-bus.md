# ADR-0003: Use NATS as distributed message bus

Date: 2023-01-10

## Status

Accepted

Related to [ADR-0005: Use standard NATS clients if available](0005-use-standard-nats-clients-if-available.md)

Amended by [ADR-0006: NATS message format](0006-nats-message-format.md)

## Context
<!-- The issue that motivates this decision and any context that influences or constrains the decision. -->

For Telestion to be truly extensible and modular, various aspects of the application might have to be written in different programming languages (e.g., scientists might prefer to write specific parts of the application in Python).

A vendor lock in (for example into *Vert.x*) is therefore not advised. There are several solutions for message buses that are not vendors or library-specific. They include (apart from many others that were not deeply looked into for several reasons):

- RabbitMQ [^RabbitMQ]
- Apache Kafka [^Kafka]
- NATS [^NATS]

[^RabbitMQ]: [RabbitMQ homepage](https://www.rabbitmq.com/)
[^Kafka]: [Apache Kafka homepage](https://kafka.apache.org/)
[^NATS]: [NATS homepage](https://nats.io/)

Each of the solutions have several advantages and disadvantages. The most important factors for the project are as follows:

- Relatively lightweight (not too complex to deploy and/or understand)
- mature and well-supported
- allowing for easy clustering and scaling
- integrated authentication authorization support
- supporting many languages, and especially TypeScript, Java, Python, Elixir, and others

From the various considered options, NATS seems to fit our requirements the best.

Of special note is also the [*queue groups*](https://docs.nats.io/nats-concepts/core-nats/queue) feature that has the potential to make clustering/scaling (even in a broadcast pattern) easy, as demonstrated in the following video (beginning at 5:25):

[NATS demo video](https://youtu.be/hjXIUPZ7ArM?t=325)

It also offers an extensive [authentication/authorization feature](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro), [*subject hierarchies*](https://docs.nats.io/nats-concepts/subjects), and more.

Also, according to [nats.io](https://nats.io/), it's used by many big companies, such as *PayPal*, *AT&T*, *Netlify*, *Siemens*, and others, and supports [clients for many different languages](https://nats.io/download/#clients).

## Decision
<!-- The change that we're proposing or have agreed to implement. -->

We will use NATS as the distributed message bus/message broker for Telestion.

We will use NATS' integrated authentication and authorization features to handle authentication and authorization for Ground Station operators to have a single source of truth for authentication and authorization.

We will no longer feature an event bus bridge, but instead connect clients directly to the NATS server.

## Consequences
<!-- What becomes easier, or more difficult to do and any risks introduced by the change that will need to be mitigated? -->

We will no longer be able to use Vert.x' EventBus for communication between components. Instead, we will have to use NATS' client libraries for the respective programming languages.

Authentication and authorization will be handled by NATS' built-in features. Authorization will therefore be exclusively up to the message addresses.

We will have to deploy and maintain a NATS cluster for the project.

We will have to implement a NATS client for the Telestion Client. This will be based on NATS SDKs but feature an easier API for the Telestion Client.

We will have to implement a NATS client for the Telestion Application. This will be based on NATS SDKs but feature an easier API for the Telestion Application.



