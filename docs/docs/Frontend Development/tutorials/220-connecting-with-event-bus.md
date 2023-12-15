---
title: Connecting the widget with the Event Bus
# e.g., "Publishing messages to the event bus" or "Installing a dependency using npm"

description:
  Use the APIs provided by the `@wuespace/telestion-client-core` package to
  integrate your widgets into the Application's event bus to visualize actual
  Telemetry data and send Telecommands.
---

In this tutorial, you'll extend your widget from the
[Building UI using React Spectrum tutorial](../building-ui-using-react-spectrum)
to show some actual data and be able to send commands when pressing the "Reset"
button.

!!! info "Prerequisites"
	To complete this tutorial, you should be familiar with React hooks, NodeJS, and
	the concept of the Event Bus. You should also have access to the code from the
	[Building UI using React Spectrum tutorial](../building-ui-using-react-spectrum)
	as you'll extend the widget from that tutorial.

## What you'll build

You'll use the Event Bus bridge and its APIs from the
`@wuespace/telestion-client-core` package to interact with the Event Bus
directly from your widget. You'll also build a mock server so that you can test
your widget without the overhead of running the entire (Java-based) Application
layer.

First, you'll add a mock Application server. Then, you'll use the
`useSubjectLatest()` hook to display actual data. Lastly, you'll send an Event
Bus message when an operator presses the "Reset" button.

In the end, you'll have written the following code:

```typescript
import {
	CallbackId,
	MockServer,
	OnClose,
	OnInit
} from '@wuespace/vertx-mock-server';

class MyMockServer extends MockServer implements OnInit, OnClose {
	private resetListener: CallbackId = 0;
	private systemStatusIntervalId: any;

	onInit() {
		const systems = ['SAT A', 'SAT B', 'SAT C'];

		this.resetListener = this.register('reset', raw => {
			console.log('Received reset request:', raw.message);
		});

		this.systemStatusIntervalId = setInterval(() => {
			systems.forEach(system => {
				this.send(`system-status/${system}`, Math.random() > 0.5);
			});
		}, 2000);
	}

	onClose() {
		this.unregister(this.resetListener);
		clearInterval(this.systemStatusIntervalId);
	}
}

const mockServer = new MyMockServer();

export function onReady() {
	console.log('Starting mock Application Server');
	mockServer.listen();
}
```

```js
const path = require('path');

module.exports = {
	plugins: [path.join(__dirname, 'src', 'plugins', 'mock-server.ts')]
};
```

```typescript
import {
	useBroadcast,
	useSubjectLatest
} from '@wuespace/telestion-client-core';

// [...]

function Indicator(props: { system: string }) {
	const broadcast = useBroadcast('reset');
	const status = useSubjectLatest(`system-status/${props.system}`) ?? false;

	return (
		<Flex alignItems={'baseline'} gap={'size-200'}>
			<StatusLight variant={status ? 'positive' : 'negative'}>
				{props.system} {status ? 'Connected' : 'Disconnected'}
			</StatusLight>
			<ActionButton onPress={() => broadcast({ system: props.system })}>
				Reset
			</ActionButton>
		</Flex>
	);
}
```

## Step 1: Add an event bus mock server for local testing

Install the `@wuespace/vertx-mock-server` package by running the following
terminal in your client project folder:

```sh
npm i -D @wuespace/vertx-mock-server
```

Add a file for your new plugin called `src/plugins/mock-server.ts` with the
following code:

```typescript
import {
	CallbackId,
	MockServer,
	OnClose,
	OnInit
} from '@wuespace/vertx-mock-server';

class MyMockServer extends MockServer implements OnInit, OnClose {
	private resetListener: CallbackId = 0;
	private systemStatusIntervalId: any;

	onInit() {
		const systems = ['SAT A', 'SAT B', 'SAT C'];

		this.resetListener = this.register('reset', raw => {
			console.log('Received reset request:', raw.message);
		});

		this.systemStatusIntervalId = setInterval(() => {
			systems.forEach(system => {
				this.send(`system-status/${system}`, Math.random() > 0.5);
			});
		}, 2000);
	}

	onClose() {
		this.unregister(this.resetListener);
		clearInterval(this.systemStatusIntervalId);
	}
}

const mockServer = new MyMockServer();

export function onReady() {
	console.log('Starting mock Application Server');
	mockServer.listen();
}
```

This code creates a plugin that gets called in the Electron thread once the
Electron thread gets started (when running `npm start`). It creates a mock
server which does two things:

1. it registers a listener on the `reset` subject address and logs messages to
   that subject to the console (for your reset buttons)
2. every two seconds, send a connected status (`boolean`) to the subject address
   `system-status/[system]` for your three systems

To load the plugin, you need to do one last step: in the client's root folder,
there is a `telestion.config.js` that exports an empty object right now. Adjust
it to include a list of plugins with your new plugin:

```js
const path = require('path');

module.exports = {
	plugins: [path.join(__dirname, 'src', 'plugins', 'mock-server.ts')]
};
```

When you now restart the `npm start` command (that is, re-run
`tc-cli start --electron`), you can see the message
`Starting Mock Application Server` in the terminal.

:::tip

When making changes to the `telestion.config.js` file or any file referenced by
it (for example, plugins), you need to restart the `tc-cli start` command (or
`npm start`) to use your changes.

:::

After logging in as `admin` into `http://localhost:9870/bridge` (with an
arbitrary password) in your Electron application, after a couple of seconds, you
should see the connection status indicator in the navigation bar turning green
and saying "Connected."

## Step 2: Connect the widget's connection status indicators to the event bus

Now that you have a mock server publishing your system status every two seconds,
you need to connect your widget to that data. Thankfully, this isn't too
difficult with the help of the `useSubjectLatest` hook exported by the
`@wuespace/telestion-client-core` package.

The `useSubjectLatest()` hook listens to messages on a specific subject address
and always returns the latest status from there.

Adjust the `<Indicator />` functional component to use the hook to listen to the
system status on the system's system status subject and wire up your UI to use
the new status:

```typescript
// [...]
// highlight-start
import { useSubjectLatest } from '@wuespace/telestion-client-core';
// highlight-end

// [...]

function Indicator(props: { system: string }) {
	// highlight-next-line
	const status = useSubjectLatest(`system-status/${props.system}`) ?? false;

	return (
		<Flex alignItems={'baseline'} gap={'size-200'}>
			// highlight-start
			<StatusLight variant={status ? 'positive' : 'negative'}>
				{props.system} {status ? 'Connected' : 'Disconnected'}
			</StatusLight>
			// highlight-end
			<ActionButton>Reset</ActionButton>
		</Flex>
	);
}
```

Take note of the `?? false`. This defaults the value to `false` in case it's
`undefined`. The default value is for when the widget hasn't received a system
status yet (which happens when initially loading the widget).

After saving the file and reloading the client, you can see the status
indicators change randomly every two seconds:

<Image src="img/client/my-first-widget/05.png" center />

## Step 3: Wiring up the "Reset" button

To make the "Reset" button broadcast a message to the `reset` subject (that
you're listening for in your mock server) when pressed, you can use the
`useBroadcast()` hook from the `@wuespace/telestion-client-core` package.

Like before, you can do this directly in your `<Indicator />` component. The
`useBroadcast()` hook takes the subject address as its first argument and
returns a function to broadcast a message to that address.

Define a function `broadcast` that publishes to your `reset` subject. Use the
Reset button's `onPress` event to call that function to broadcast a message to
that subject. Pass an object containing details about the system into the
message:

```typescript
// [...]
import {
	// highlight-next-line
	useBroadcast,
	useSubjectLatest
} from '@wuespace/telestion-client-core';

// [...]

function Indicator(props: { system: string }) {
	// highlight-next-line
	const broadcast = useBroadcast('reset');
	const status = useSubjectLatest(`system-status/${props.system}`) ?? false;

	return (
		<Flex alignItems={'baseline'} gap={'size-200'}>
			<StatusLight variant={status ? 'positive' : 'negative'}>
				{props.system} {status ? 'Connected' : 'Disconnected'}
			</StatusLight>
			// highlight-start
			<ActionButton onPress={() => broadcast({ system: props.system })}>
				Reset
			</ActionButton>
			// highlight-end
		</Flex>
	);
}
```

When you reload your client application and press the reset buttons, you can see
corresponding output in the terminal where you ran `npm start`:

```text
Received reset request: { system: 'SAT C' }
Received reset request: { system: 'SAT B' }
Received reset request: { system: 'SAT A' }
Received reset request: { system: 'SAT B' }
Received reset request: { system: 'SAT C' }
```

## Next steps

<!-- Short concluding sentence: -->

Congratulations, your widget is now fully wired up to the Event Bus. It's now up
to the backend developers to create Verticles that connect the actual mission
I/O interfaces to these Event Bus messages :wink:.

But even more, you're now capable of wiring up any system to the event bus,
meaning you can build any widget, you need using plain React for the UI and the
APIs to connect to the event bus.

In the following tutorial, you'll learn how you can add configuration options to
your widget to allow Ground Station operators (that is, your users) to
re-configure your widget's behavior on the fly.

You should also familiarize yourself with the API Reference for the
`@wuespace/vertx-mock-server` package to build more complex mock servers as well
as the API Reference for the various Event Bus hooks in the
`@wuespace/telestion-client-core` package:

<!-- Links to next steps/related articles -->

<Reference to="https://wuespace.github.io/telestion-client/@wuespace/vertx-mock-server/">
	<code>@wuespace/vertx-mock-server</code> API Reference
</Reference>
<Reference to="https://wuespace.github.io/telestion-client/@wuespace/telestion-client-core/#useBroadcast">
	<code>useBroadcast</code> Hook API Reference
</Reference>
<Reference to="https://wuespace.github.io/telestion-client/@wuespace/telestion-client-core/#useSubject">
	<code>useSubject</code> Hook API Reference
</Reference>
<Reference to="https://wuespace.github.io/telestion-client/@wuespace/telestion-client-core/#useSubjectLatest">
	<code>useSubjectLatest</code> Hook API Reference
</Reference>
<Reference to="https://wuespace.github.io/telestion-client/@wuespace/telestion-client-core/#useRequest">
	<code>useRequest</code> Hook API Reference
</Reference>

<!--
Snippets
--------

<Reference to="../other-article">
    Relative Link to other article
</Reference>

<Reference to="https://www.example.com">
    Example Website
</Reference>
-->
