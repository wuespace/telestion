# ADR-0005: Use standard NATS clients if available

Date: 2023-01-24

## Status

Accepted

Related to [ADR-0003: Use NATS as distributed message bus](0003-use-nats-as-distributed-message-bus.md)

## Context
<!-- The issue that is motivating this decision and any context that influences or constrains the decision. -->

To connect to the NATS message broker, we need NATS client libraries for the various programming languages/environments that get used to build Telestion components (services, frontends, etc.).

NATS offers [preexisting client libraries](https://nats.io/download/) for a lot of programming languages / environments. NATS provides documentation and many examples on using many of these libraries.

Historically, especially on the client side, we developed our own adapter for connecting to the Vert.x event bus bridge (because the existing clients provided a bad developer experience and little to no TypeScript support), which meant maintenance of a system depending on a protocol outside our control. This posed a lot of overhead and complex code.

Based on our evaluation, as of the time of this ADR's writing, the NATS client libraries offer a decent (but not great) API/developer experience, but naturally (mostly, depending on the language and library version) support all NATS concepts.

## Decision
<!-- The change that we're proposing or have agreed to implement. -->

W**e will use (and recommend the usage of) the NATS client libraries recommended by NATS.** We won't build our own client libraries unless none (that's suitable / that meets the technical requirements) exists for a targeted language/environment.

We will still be able to supersede this decision if, at any point in time, we have the resources to provide our own NATS client libraries and/or the advantages justify the effort.

## Consequences
<!-- What becomes easier, or more difficult to do and any risks introduced by the change that will need to be mitigated? -->

- the APIs might not be as neatly integrated into our ecosystem as could be possible
- we don't face the overhead of maintaining NATS clients in several languages
- we don't reinvent the wheel and developers can thus use existing knowledge / external knowledge (documentation, Stack Overflow answers, etc.) about general NATS usage instead of Telestion-specific APIs
- Migrating `telestion-client` projects to the new event bus format is more work than if we developed compatible APIs for that environment
