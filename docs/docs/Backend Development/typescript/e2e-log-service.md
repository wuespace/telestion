---
tags: [Backend, TypeScript]
---

# End to end example: Log Service

!!! note
	The author generated this text in part with GPT-3, OpenAI’s large-scale language-generation model. Upon generating draft language, the author reviewed, edited, and revised the language to their own liking and takes ultimate responsibility for the content of this publication.

This tutorial will explain step-by-step how to write a log service that will listen for messages on the `log.>` subject and write them to a file.

## Steps

1. First, we need to import the `startService` function from our library (`lib.ts`) and the `encode` function from the standard Deno library.

	```ts
	import { startService } from "https://deno.land/x/telestion/mod.ts";
	import { encode } from "https://deno.land/std@0.186.0/encoding/hex.ts";
	```

2. Next, we create a new TextEncoder instance. This will be used to turn messages into a format that can be written to a file.

	```ts
	const encoder = new TextEncoder();
	```

3. We then call the `startService` function to set up our service. This will return an object containing information about the message bus that we can use to subscribe to messages.

	```ts
	const { messageBus } = await startService();
	```

4. We then subscribe to the message bus, using a wildcard subscription for any messages published on the `log.>` subject. This will allow us to receive all messages published on any topics starting with `log.`.

	```ts
	const logMessages = messageBus.subscribe("log.>");
	```

5. We use a for-await-of loop to receive messages from the message bus. For each message, we extract the subject (split the string on `.`, then take the second element) and the message data, which we encode using the `encode` function from the standard library.

	```ts
	for await (const msg of logMessages) {
	  try {
		const currentTime = new Date().toISOString();
		const logMessage = encode(msg.data).toString();
		const subject = msg.subject.split(".")[1];
	```

6. We log the message to the console and write it to a file (appending it to the end).

	```ts
		console.log(`${currentTime} [${subject}] ${logMessage}`);
		await Deno.writeFile(
		  "log.txt",
		  encoder.encode(`${currentTime} [${subject}] ${logMessage}\n`),
		  { append: true },
		);
	  } catch (error) {
		console.error(error);
	  }
	}
	```

And that's it! Our service is now complete and ready to be used.

## Final Code

```ts
import { startService } from "https://deno.land/x/telestion/mod.ts";
import { encode } from "https://deno.land/std@0.186.0/encoding/hex.ts";

const encoder = new TextEncoder();

const { messageBus } = await startService();

const logMessages = messageBus.subscribe("log.>");

for await (const msg of logMessages) {
  try {
    const currentTime = new Date().toISOString();
    const logMessage = encode(msg.data).toString();
    const subject = msg.subject.split(".")[1];

    console.log(`${currentTime} [${subject}] ${logMessage}`);
    await Deno.writeFile(
      "log.txt",
      encoder.encode(`${currentTime} [${subject}] ${logMessage}\n`),
      { append: true },
    );
  } catch (error) {
    console.error(error);
  }
}
```
