---
 tags:
   - Backend
   - TypeScript
---
# Interacting with the Message Bus

The message bus is a simple, lightweight, and fast way to send messages between different parts (_services_) of your application. It is a simple publish/subscribe system that allows you to send messages to a specific subject and have any listeners on that subject receive the message.

!!! warning "Running NATS for development"
 Now that we want to interact with the message bus, we need to have NATS running. If you're using the `--dev` mode for testing your service, it's sufficient to run the [`nats-server` executable](https://nats.io/download/){target=_blank} in a separate terminal window. This will start a local NATS server on port `4222` which is the default port for NATS.

 If you have a prdouction-like setup, you'll need to pass the `NATS_USER` and `NATS_PASSWORD` corresponding to your NATS configuration as configuration parameters to your service for authentication.

## Connecting to the Message Bus

Connecting to the event bus is automatically handled by the `startService` function. It will connect to the message bus using the `NATS_URL` environment variable. If you're running the service in `--dev` mode, this will be `nats://localhost:4222` by default.

All you need to do compared to the previous examples is to omit the `{ nats: false }` parameter from the `startService` function call:

```typescript title="service.ts"
import {
    startService
} from "jsr:@wuespace/telestion";

const {nc/* (1)! */} = await startService(/* (2)! */);
```

1. Store the NATS connection in a variable called `nc` for later use.
2. Omit the `{ nats: false }` parameter from the `startService` function call since we want to connect to the message bus.

!!! note
 `startService` actually returns an object containing the NATS connection (`nc`) and a few other things. In our example, we use [destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment){target=_blank} to only get the `nc` variable. This is equivalent to the following code:

 ```typescript
 const service = await startService();
 const nc = service.nc;
 ```

## Publishing Messages

Publishing messages is as simple as calling the `publish` function on the NATS connection:

```typescript
await nc.publish("subject"/*(1)!*/, message/*(2)!*/);
```

1. The _subject_ (sometimes also called _channel_) to which the message gets published.
2. The message data (also called _payload_ or _body_).

However, Telestion Hub uses a specific message format for all messages sent over the message bus. A message can be either JSON or a binary message. The binary message is used for sending large amounts of data, e.g., images or video streams. The JSON message is used for all other messages.

### JSON Messages

To send a JSON message, you need to create a JSON object and pass it to the `publish` function:

```typescript title="service.ts"
import {
    startService
} from "jsr:@wuespace/telestion";

const {nc} = await startService();

await nc.publish("subject", JSON.stringify/*(1)!*/({
    foo: "some arbitrary JSON-compatible data",
    bar: 42
}));
```

1. Encode the object into a JSON `string`.

### Binary Messages

To send a binary message, you need to create a `Uint8Array` containing the bytes and pass it to the `publish` function:

```typescript title="service.ts"
import {
    startService
} from "jsr:@wuespace/telestion";

const {nc} = await startService();

await nc.publish("subject", new Uint8Array([0x01, 0x02, 0x03]));
```

!!! tip "Uint8Arrays"
 You can learn more about how you can use `Uint8Array` on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array#different_ways_to_create_a_uint8array){target=_blank}.

## Subscribing to Messages

There are multiple ways to subscribe to messages on a subject. The most common way is to use the `subscribe` function in combination with a `for await` loop:

```typescript title="service.ts"
import {
    startService
} from "jsr:@wuespace/telestion";

const {nc} = await startService();

const subjectSubscription/*(1)!*/ = await nc.subscribe("subject"/*(2)!*/);

for await (const message of subjectSubscription) {//(3)!
    console.log(message.data);//(4)!
}
```

1. Store the subscription in a variable called `subjectSubscription` for later use.
2. Subscribe to the `subject` subject.
3. For each message received on the subject, ...
4. ... print the message data to the console.

Unfortunately, this won't decode our JSON messages automatically. We need to do this ourselves:

```typescript title="service.ts"
import {
    startService
} from "jsr:@wuespace/telestion";

const {nc} = await startService();

const subjectSubscription = await nc.subscribe("subject");
for await (const message of subjectSubscription) {
    const jsonMessage = message.json();//(1)!
    console.log(jsonMessage.foo);//(2)!
}
```

1. Decode the message payload using the built-in `json()` method. This will decode the message data if it's a JSON message and throw an error if it's not.
2. Print the `foo` property of the decoded JSON message to the console.

!!! danger
 Can you spot the problem with this code? What happens if the message data doesn't contain a `foo` property? Or if it's not a JSON message at all? This would lead to our service crashing!

 **Never assume a message's structure!**

 You should always validate the message data before using it. We'll cover this in the next section.

### Validating Messages

A Telestion service must validate all messages it receives. This is to ensure that the service doesn't crash when it receives invalid messages.

#### Validating the message type

The first "layer" of validation is the message type. A message can either be a JSON message or a binary message. The `Msg.json()` function will throw an error if the message data is not a valid JSON message. Therefore, we can use a `try`/`catch` block to catch the error and handle it accordingly:

```typescript title="service.ts"
// ...

for await (const message of subjectSubscription) {
    try/*(3)!*/{
        const jsonMessage = message.json();
        console.log(jsonMessage.foo);
    } catch (_e) {
        console.error/*(2)!*/("Received invalid message:", message);
    }
}
```

1. Catch the error thrown by `Msg.json()`.
2. Print the error message to the console (or do whatever else you want to do when you receive an invalid message).
3. Wrap the code that decodes the message in a `try`/`catch` block.

!!! note "Binary Messages"
 Since any messages get sent as binary messages (in fact, the `json()` function does nothing else than convert the JSON message from a `Uint8Array`), there's no way to validate that a message is supposed to be a binary message. This makes the next section even more important.

#### Validating the message structure

The second "layer" of validation is the message structure. This is where you validate that the message data contains all the properties you expect it to contain. For example, if you expect a message to contain a `foo` property, you must verify its existence before using it.

For structured JSON data, we recommend that you use the `zod` library for validation. This is also used in our `lib.ts` file to validate the configuration. You can find more information about `zod` on the library's [documentation site](https://zod.dev/api){target=_blank}.

Let's create a `zod` schema for our JSON message in a new file called `foo-message.ts`:

```typescript title="foo-message.ts"
import {
    z
} from "jsr:@zod/zod";

export const fooMessageSchema = z.object/*(1)!*/(({
    foo: z.string()/*(2)!*/,
    bar: z.number().min(-10)/*(3)!*/
});

export type FooMessage = z.infer<typeof fooMessageSchema>;//(4)!
```

1. A `FooMessage` must be an object.
2. A `FooMessage` must have a `foo` property that is a string.
3. A `FooMessage` must have a `bar` property that is a number and is greater than or equal to `-10`.
4. This is a TypeScript type that represents the `FooMessage` type. While we won't use it in this example, it's good practice to create a type for each schema you create. This allows you to use the type anywhere in your code:

   ```typescript
   function foo(message: FooMessage) {
     console.log(message.foo);
   }
   
   // ...
   
   const fooMessage = fooMessageSchema.parse(
     jsonCodec.decode(message.data)
   );
   foo(fooMessage); // This works now!
   ```

Now we can use this schema to validate the message data:

```typescript title="service.ts"
import {
    fooMessageSchema
} from "./foo-message.ts";

// ...

for await (const message of subjectSubscription) {
    try {
        const jsonMessage = fooMessageSchema.parse/*(1)!*/(
            message.json()
        );

        console.log(jsonMessage/*(2)!*/.foo);
    } catch (_e) {
        console.error("Received invalid message:", message);
    }
}
```

1. Validate the message data using the `fooMessageSchema` schema. This will throw an error if the message data doesn't match the schema.
2. TypeScript now knows that `jsonMessage` is a valid `FooMessage` object. Therefore, we can access the `foo` property without any problems.

!!! success
 If your editor has great TypeScript support and has shown you warnings/errors before, they are now gone! This is because TypeScript now knows that the `jsonMessage` variable is a valid `FooMessage` object. In other words, your code is now safe from invalid messages!

!!! note "Binary Messages"
 For binary messages, you can't use `zod` to validate the message structure. Instead, you should use the `Uint8Array` methods to validate the message structure. For example, you can check the length of the message data using the `length` property of the `Uint8Array`:

 ```typescript
 if (message.data.length !== 3) {
     console.error("Received invalid message:", message);
 }
 ```

 However, the exact validation required completely depends on your use case. Just make sure that your code doesn't crash when it receives an invalid message.

### Subscribing to Multiple Topics

So far, we've used the `for await` loop. This is a convenient way to subscribe to a single topic. However, if you want to do more than just react to messages from a specific subject, we get into trouble. Since the `for await` loop is blocking, we can't do anything else while we're waiting for messages.

We can solve this by wrapping the `for await` loop in an `async` function and calling it in a separate thread. This allows us to do other things while we're waiting for messages:

```typescript title="service.ts"
// ...

const subjectMessages = nc.subscribe("foo");
(async () => {//(1)!
 for await (const message of subjectMessages) {
  // Handle messages from the "foo" subject
 }
})();

// ... (2)
```

1. Wrap the `for await` loop in an `async` function and call it immediately. This will start the subscription in parallel to the rest of the code.
2. Do other things while we're waiting for messages.

Note that we're storing the return value of `nc.subscribe` in a variable outside the `async` function. This is important so that we can close the subscription or check its status later.

!!! note "Closing the Subscription"
 You can close the subscription by calling the `unsubscribe` method on the subscription object:

 ```typescript
 const subjectMessages = nc.subscribe("foo");
 // ...
 subjectMessages.unsubscribe();
 ```

 **You must call `unsubscribe` on the subscription object.** Calling `nc.unsubscribe` will unsubscribe from **all** subscriptions!

This now allows us to subscribe to multiple topics:

```typescript title="service.ts"
// ...

const fooMessages = nc.subscribe("foo");//(1)!
(async () => {
    for await (const message of fooMessages) {
        // Handle messages from the "foo" subject
    }
})();

const barMessages = nc.subscribe("bar");//(2)!
(async () => {
    for await (const message of barMessages) {
        // Handle messages from the "bar" subject
        if (shouldUnsubscribeFoo(message))
            fooMessages.unsubscribe/*(3)!*/();
  
  if (shouldUnsubscribeBar(message))
   barMessages.unsubscribe/*(4)!*/();
    }
})();

await Promise.all/*(5)!*/([
 fooMessages.closed,
 barMessages.closed
]);

console.log("All subscriptions closed!");//(6)!
```

1. Subscribe to the `foo` subject.
2. Subscribe to the `bar` subject (in parallel to the `foo` subscription).
3. Unsubscribe from the `foo` subject if the `shouldUnsubscribeFoo` function returns `true`.
4. Unsubscribe from the `bar` subject if the `shouldUnsubscribeBar` function returns `true`.
5. Wait for both subscriptions to close. This will happen when the `unsubscribe` method is called on the subscription object.<p> The `closed` property is a `Promise` that resolves when the subscription is closed.<p> `Promise.all` is a convenient way to wait for multiple promises to resolve. It returns a `Promise` that resolves when all promises passed to it have resolved.
6. Log a message when both subscriptions are closed.

### Queue Groups

!!! info
 Queue groups are a way to distribute messages between multiple subscribers. If you have multiple subscribers to a subject, you can use queue groups to distribute messages between them. This is useful if you want to distribute messages between multiple instances of a service (for example, if you want to scale your service horizontally because processing a message takes too long).

All you have to do to use queue groups is to pass a `queue` option to the `subscribe` method. You can use any string as the queue name, but by its definition, the `SERVICE_NAME` configuration parameter works perfect for this. For convenience, this gets exposed as `serviceName` on the object returned by `startService`:

```typescript title="service.ts"
// ...

const {
    nc,
    serviceName/*(1)!*/
} = await startService();

const fooMessages = nc.subscribe(
    "foo", 
 {queue: serviceName/*(2)!*/}
);
(async () => {
    for await (const message of fooMessages) {
        // Handle messages from the "foo" subject
    }
})();

// ...
```

1. Get the `serviceName` from the object returned by `startService`.
2. Pass the `serviceName` as the `queue` option to the `subscribe` method.

If you now run multiple instances of your service, you'll see that messages are distributed between them. This is because the `queue` option tells the message bus to distribute messages between all subscribers with the same queue name.

!!! warning "Service names in development mode"
 When you run your service in development mode, the `serviceName` will be generated. This means that you'll get a different service name every time you start your service. To avoid this, you can either set the `SERVICE_NAME` environment variable or pass a service name via the CLI:

 ```bash
 deno run --allow-all service.ts --dev --SERVICE_NAME=foo
 ```

### Wildcards

Wildcards are a way to subscribe to multiple subjects at once. This is useful if you want to subscribe to multiple subjects that have a common prefix. For example, you could have a service that handles all requests to the `/api` endpoint. You could then subscribe to all requests to the `/api` endpoint by subscribing to the `api.>` subject.

There are two types of wildcards: `*` and `>`. The `*` wildcard matches a single token. The `>` wildcard matches one or more tokens. For example, the `api.*` subject matches `api.foo` and `api.bar`, but not `api.foo.bar`. The `api.>` subject matches `api.foo`, `api.bar`, and `api.foo.bar`.

You can use wildcards in the `subscribe` method and then use the `subject` property of the message to check which subject the message was sent to:

```typescript title="service.ts"
// ...

/**
 * A simple key-value store.
 */
const store: Record<string, unknown> = {};

const kvMessages = nc.subscribe/*(1)!*/("kv.>");
(async () => {
    for await (const message of kvMessages) {
        try {
            const [_kv, action, ...keyParts] =
                message.subject.split/*(2)!*/(".");

            const key = keyParts.join(".");

            if (action === "get") {
                // retrieve the value from the store
                message.respond(
                    JSON.stringify(store[key])
                );
            } else if (action === "set") {
                // set the value in the store
                store[key] = message.json();
                message.respond(JSON.stringify({ok: true});
            }
        } catch (error) {
            message.respond(
                JSON.stringify({error: error.message})
            );
        }
    }
})();
```

1. Subscribe to the `kv.>` subject. This matches all subjects that start with `kv.`.
2. Split the subject into tokens. The first token is `kv`, the second token is the action, and the rest of the tokens are the key. We store these into variables using array destructuring.

In this example, we subscribe to the `foo.*` subject. We then use the `subject` property of the message to check which action was requested. If the action is `get`, we get the value from the `store` object and respond with it. If the action is `set`, we set the value in the `store` object.

For example, if we send a message to the `foo.get.bar` subject, we'll get the value of the `bar` key in the `store` object. If we send a message to the `foo.set.bar` subject with the value `42`, we'll set the value of the `bar` key in the `store` object to `42`.

!!! success
 Woohoo! You've just re-implemented a key-value store using the message bus, which (with a few convenience features on top) is an essential part of Telestion's standard services! :tada:

## Request/Reply

So far, we've looked at publishing messages and subscribing to messages. However, there's one more thing we can do with the message bus: request/reply.

Request/reply is a pattern where one service sends a request to another service and waits for a response. This is useful if you want to get data from another service. For example, you could have a service that stores data in a database. Other services can then request data from this service.

### Sending a Request

Let's start by looking at how we can send a request. We can use the `request` method on the `NatsConnection` object to send a request. This makes it incredibly easy to send a request:

```typescript title="service.ts"
// ...

const response = await nc.request/*(1)!*/(
    "fooRequest"/*(2)!*/,
    JSON.stringify({foo: "bar"})/*(3)!*/
);
console.log(response.data);
```

1. Call the `request` method on the `NatsConnection` object. This method returns a `Promise` that resolves when the response is received. The response has the same form as the messages we've already seen in our `for await` loops.
2. Specify the subject to send the request to.
3. Encode the request message data using the `jsonCodec` codec. This is the same as we've done before.

!!! tip "Tip: Specifying a timeout"
 As it is, our code will wait forever for a response. This is probably not what we want. We can specify a timeout by passing a second argument to the `request` method:

 ```typescript
 const response = await nc.request(
     "fooRequest", 
  JSON.stringify({foo: "bar"}),
  {timeout: 1000}
 );
 ```

 This will cause the `request` method to reject the `Promise` if no response is received within 1000 milliseconds. Make sure to handle the rejection by handling it appropriately.

### Handling a Request

Now that we know how to send a request, let's look at how we can handle a request. We can use the `subscribe` method on the `NatsConnection` object to subscribe to a subject. This allows us to handle requests:

```typescript title="service.ts"
// ...

const requestMessages = nc.subscribe/*(1)!*/("fooRequest");

(async () => {
 for await (const message of requestMessages) {//(2)!
  message.respond/*(3)!*/(JSON.stringify({bar: "baz"}));
 }
})();
```

1. Subscribe to the `fooRequest` subject as usual.
2. Iterate over the messages received from the `fooRequest` subject as usual.
3. Respond to the request by calling the `respond` method on the message object. This method takes a single argument: the response message data. This is the same as we've done before.

!!! tip
 The `message` received from the `fooRequest` subject is the same as the `message` received from the `foo` subject. This means that we can use the same steps to handle the message as we've done before if we need the data to handle the request.

## Related Links

While we've covered the basics of interacting with the message bus in this article, there are a few more things you can do with the message bus. You can find more information about the message bus in the [NATS documentation](https://docs.nats.io/using-nats/developer){target=_blank}. While the connection to the message bus is handled by the `startService` function, topics like [receiving](https://docs.nats.io/using-nats/developer/receiving){target=_blank} and [sending](https://docs.nats.io/using-nats/developer/sending){target=_blank} messages are covered more extensively (including useful concepts like request/reply, queue groups, etc.) in the NATS documentation.
