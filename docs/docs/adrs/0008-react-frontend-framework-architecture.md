# ADR-0008: React Frontend Framework Architecture

Date: 2024-01-06

## Status

Accepted

## Context
<!-- The issue that is motivating this decision and any context that influences or constrains the decision. -->

Previously, the `telestion-client` architecture was a complicated system that consisted of multiple libraries (that partially depended on each other), custom tooling, and a lot of boilerplate code. This made it hard to maintain and extend the framework.

There wasn't a clear separation between the framework and the application. It wasn't clear which parts of the boilerplate were to be considered as part of the framework and which parts were to be considered as part of the application.

User feedback also showed that the framework was too complicated and hard to understand. There wasn't a clear separation of concerns, and thus, no clear interface between the developers of the framework and the developers of the application.

## Decision
<!-- The change that we're proposing or have agreed to implement. -->

Under careful consideration of these reasons, be it resolved that:

### Technical Architecture

The `telestion-client` framework will be rewritten from scratch. 

The framework live under the `@wuespace/telestion` package that can be installed via npm.

The framework will be written in TypeScript and will be based on React.

### Developer Experience

Telestion frontend applications can be built using any build tool that supports TypeScript and React.

Bootstrapping a new application consists of importing a single `initTelestion` (or similar) function from the `@wuespace/telestion` package and calling it.

Adding a widget is as easy as calling a `regsiterWidget` (or similar) function from the same package.

### User Experience

Dashboard configurations will be stored on the user's device. This will allow the user to save their dashboard configurations and load them again later.

## Consequences
<!-- What becomes easier, or more difficult to do and any risks introduced by the change that will need to be mitigated? -->

Upon acceptance of this decision, the following consequences will take effect:

### Deprecation of the previous framework / architecture

The previous framework will be deprecated and will not be maintained anymore.

While guidance on migration can be provided, it is not guaranteed that the migration will be fully straightforward.

### Improved Developer Experience

The new framework will be easier to understand and use.

### Better Maintainability

The new framework will be easier to maintain and extend.
