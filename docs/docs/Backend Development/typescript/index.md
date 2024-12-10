---
 tags:
   - Backend
   - TypeScript
---

# Writing a Backend Service in TypeScript

TypeScript is the recommended language for writing backend services. It is a superset of JavaScript that adds static typing and other features that make it easier to write and maintain code.

## Prerequisites

To write a backend service in TypeScript, you should be familiar with JavaScript and (ideally) TypeScript. Overall, basic JavaScript knowledge will be sufficient to get started, but `async`/`await` and Promises are used extensively for services, so you should be familiar with these topics.

## Deno

Deno is a JavaScript/TypeScript runtime that is built on top of V8, Rust, and Tokio. It is a secure runtime for JavaScript and TypeScript.

Compared to Node.js, Deno has the following advantages:

* It has built-in TypeScript support
* It has built-in security features
* It's easier to deploy

### Installing Deno

To install Deno, please follow the instructions on the [Deno website :octicons-link-external-16:](https://deno.com/manual/getting_started/installation){target="_blank"}.

## Writing a basic Service

### Creating a new Service

Create a new directory for your service:

```bash
mkdir my-service
cd my-service
```

Create a new file called `service.ts`:

```bash
touch service.ts
```

### Writing the Service

Open `service.ts` in your favorite editor and add the following code:

```typescript title="service.ts"
import { startService } from 'jsr:@wuespace/telestion';// (1)!

await startService/*(2)!*/({
	nats: false,// (3)!
});

console.log('Hello World!');// (4)!
```

1. Import the `startService` function from the library.
2. Start the service. This automatically connects to NATS and does some other setup.
3. Disable NATS. We don't need it for this example and it would otherwise throw an error because we haven't configured it yet.
4. Log a message to the console when the service starts.

### Running the Service

To run the service, run the following command:

```bash
deno run --allow-all service.ts --dev
```

!!! success 
	You should see the following output:

	```bash
	Running in development mode. Using default values for missing environment variables.
	Hello World!
	```

!!! info "Running in development mode"
	When you run the service with the `--dev` flag, the service will use default values for missing environment variables. You'll learn more about this in the [configuration](configuration.md) section.

## Next Steps

Now that you have a basic service running, you should have a look at how to make your service configurable.

[Read more about configuration](configuration.md){ .md-button }

If you prefer to learn by example, you can also have a look at the [samples](samples.md).

[Browse samples on GitHub](https://github.com/wuespace/telestion/tree/main/backend-deno/samples){ .md-button }
