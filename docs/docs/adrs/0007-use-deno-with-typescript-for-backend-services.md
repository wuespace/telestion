# ADR-0007: Use Deno with TypeScript for backend services

Date: 2023-05-09

## Status

Accepted

## Context
<!-- The issue that is motivating this decision and any context that influences or constrains the decision. -->

_Note that terms like "backend", "service", etc., are used as described in [ADR-0004](./0004-revised-vert-x-independent-terminology.md)._

Historically, backend services for Telestion have been written in [Vert.x](https://vertx.io/)/Java (while the frontend gets built in TypeScript). This has brought with it a number of challenges, including, but not limited to:

- The need to learn and maintain two different languages (Java and TypeScript)
- Complex APIs for communication between frontend and backend (JSON isn't really a first class citizen in Java, etc.)
- Complex build processes
- Complex deployment processes
- Complex development tooling


Following our [decision to use NATS as a language-agnostic message broker](./0003-use-nats-as-distributed-message-bus.md), we now have the opportunity to consider using a language other than Java for backend services. Given that we already employ JavaScript/TypeScript for the frontend, it would be reasonable to use it for many parts of the backend as well. Doing so would allow us to leverage the same language for both frontend and backend, significantly reducing project complexity.

Although [Node.js](https://nodejs.org/) is a common choice for services written in JavaScript/TypeScript, it does have certain drawbacks. These include the necessity of compiling TypeScript files to JavaScript before execution, the need to install and maintain a variety of development tools (test runner, code formatter, linter, etc.), and the presence of a significant amount of boilerplate overhead (package.json, node_modules, configuration files, etc.).

[Deno](https://deno.com/) is a newer runtime for JavaScript/TypeScript that resolves many of these issues. We recently utilized Deno for building services during the Telestion Hackathon in May 2023, and the experience was overwhelmingly positive. As such, this ADR aims to evaluate Deno as a runtime option for TypeScript-based backend services.

### Pros of using Deno over Node.js

- **Direct execution of TypeScript files:** Deno can directly run TypeScript files, without the need for prior compilation to JavaScript. This improves the developer experience, reduces build complexity, and allows for the sharing of code between the frontend and backend.
- **Easy learning curve:** Deno is an intuitive and easy-to-learn runtime for developers experienced with JavaScript/TypeScript. Additionally, since it shares a similar environment with the browser, it is even more familiar and accessible to frontend developers, further reducing the learning curve.
- **No boilerplate requirements:** Deno does not require `package.json` or `node_modules`, streamlining the project and simplifying maintenance.
- **Built-in development tools:** The Deno CLI features built-in tools such as test runners, code formatters, linters, and dependency inspectors. This eliminates the need for separate installations and reduces complexity.
- **Compile to a single executable:** Deno can compile a TypeScript project to a standalone executable out of the box, simplifying deployment and reducing complexity.
- **Single executable distribution:** Deno is distributed as a single executable, simplifying installation and updates.
- **Enhanced security:** Deno features a built-in security model for regulating file system access, network access, and environment variables, improving the security of the services.

### Cons of using Deno over Node.js

#### Relative newness and limited adoption

Deno is newer and less widely adopted than Node.js, resulting in fewer available resources and experienced developers. However, Deno's similarity to Node.js and growing adoption rate should mitigate this issue.

#### Limited compatibility with some npm packages

Deno uses a different module system than Node.js, resulting in limited compatibility with some npm packages. However, Deno has many built-in modules that are not available in Node.js, and a growing ecosystem of packages designed specifically for Deno. This may mitigate the issue.

### Experience with Deno at the Telestion Hackathon in May 2023

During the Telestion Hackathon in May 2023, we used Deno for the first time in a production environment and built a fully functional backend service in under four hours. We found the developer experience to be very positive, and we were impressed with the ease of use and simplicity of the runtime.

We were able to write a couple of services without any prior knowledge about Deno in under four hours.

Based on our experience, we highly recommend Deno as a promising runtime for TypeScript-based backend services, and we believe it would be a great choice for future projects.

## Decision
<!-- The change that we're proposing or have agreed to implement. -->

We will recommend that developers use Deno/TypeScript for backend services. We won't require the use of Deno/TypeScript, but we will encourage it where it makes sense (if there are reasons to use something else for specific services, that continues to be supported). We will provide documentation and resources for developers to write and deploy Deno-based backend services in TypeScript.

## Consequences
<!-- What becomes easier, or more difficult to do and any risks introduced by the change that will need to be mitigated? -->

The decision to recommend the use of Deno/TypeScript for backend services will have several immediate consequences for our development process.

Firstly, we will need to update our project templates to include Deno and TypeScript as recommended options for backend services. This will involve modifying our documentation, scripts, and configuration files to ensure that developers have the necessary tools to write and deploy Deno-based services.

Secondly, we will need to provide training and resources to developers working on Telestion become familiar with Deno and TypeScript, particularly those who may be unfamiliar with these technologies. This will likely involve creating new documentation and updating existing resources to ensure that developers have access to the information they need.

Overall, these changes lead to a more efficient and effective development process even though there will be some immediate changes and additional effort required to implement the recommendation to use Deno/TypeScript for backend services.
