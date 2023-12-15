---
title: Writing a stateful dialog
# e.g., "Publishing messages to the event bus" or "Installing a dependency using npm"

description:
  Dialogs can do much more than just showing static content. Learn how you can
  create a stateful and complex dialog with the Telestion Client Common package.
---

In this tutorial, you'll write a more complex and stateful dialog for a widget
in the web client.

!!! info "Prerequisites"
	To complete this tutorial, you should be familiar with TypeScript language and the React framework. This tutorials builds upon the code from the simple dialog tutorial.

## What you'll build

In this tutorial, you'll extend the features of your simple dialog from the last
tutorial and add delivery options to the telecommand you want to send.

Take a look at the last tutorial, in case you missed anything:

[//]: # (<Reference to="/client/tutorials/writing-a-static-dialog/">)

[//]: # (	Writing a static dialog)

[//]: # (</Reference>)

The full code for this tutorial looks like this:

```typescript title='widget.tsx'
import { useState } from 'react';
import {
	ActionButton,
	Checkbox,
	Flex,
	TextField,
	View
} from '@adobe/react-spectrum';
import { showDialog } from '@wuespace/telestion-client-common';

interface DeliveryOptions {
	/**
	 * Request a transmission receipt from the target.
	 */
	requestReceipt: boolean;
	/**
	 * Resend the telecommand if a failure has happened during transmission.
	 */
	resendOnFailure: boolean;
	/**
	 * Force the telecommand to be executed on the target.
	 */
	forceExecution: boolean;
}

const defaultOptions: DeliveryOptions = {
	requestReceipt: false,
	resendOnFailure: false,
	forceExecution: false
};

function sendTC(command: string, options: DeliveryOptions): void {
	console.log('Send telecommand:', command, ', with options:', options);
}

export function Widget() {
	const [options, setOptions] = useState(defaultOptions);
	const [command, setCommand] = useState('default-command');

	const onOptions = () => {
		showDialog('options-tc', {
			title: 'Telecommand options',
			content: (state, setState) => (
				<Flex direction="column" gap="size-100">
					<Checkbox
						isSelected={state.requestReceipt}
						onChange={requestReceipt => setState({ requestReceipt })}
					>
						Request a transmission receipt from the target
					</Checkbox>
					<Checkbox
						isSelected={state.resendOnFailure}
						onChange={resendOnFailure => setState({ resendOnFailure })}
					>
						Resend the telecommand if a failure has happened during transmission
					</Checkbox>
					<Checkbox
						isSelected={state.forceExecution}
						onChange={forceExecution => setState({ forceExecution })}
					>
						Force telecommand execution on the target
					</Checkbox>
				</Flex>
			),
			initialState: options
		}).then(setOptions);
	};

	const onSend = () => {
		showDialog('custom-tc', {
			title: 'Send telecommand',
			content:
				'Are you sure you want to send the telecommand "' + command + '"?',
			initialState: undefined
		}).then(() => sendTC(command, options));
	};

	return (
		<View padding="size-200">
			<Flex direction="column" gap="size-100">
				<Flex direction="row" gap="size-100" alignItems="end">
					<TextField
						label="Telecommand"
						width="100%"
						value={command}
						onChange={setCommand}
					/>
					<ActionButton flexShrink={0} onPress={onOptions}>
						Options
					</ActionButton>
				</Flex>
				<ActionButton onPress={onSend}>Send</ActionButton>
			</Flex>
		</View>
	);
}
```

## Step 1: Define the delivery options

To be able to send delivery options with the telecommand, you need a new type
that defines the delivery options first.

Add an interface to your widget describing the new delivery options:

```typescript title='widget.tsx'
import { useState } from 'react';
import { ActionButton, Flex, TextField, View } from '@adobe/react-spectrum';
import { showDialog } from '@wuespace/telestion-client-common';

interface DeliveryOptions {
	/**
	 * Request a transmission receipt from the target.
	 */
	requestReceipt: boolean;
	/**
	 * Resend the telecommand if a failure has happened during transmission.
	 */
	resendOnFailure: boolean;
	/**
	 * Force the telecommand to be executed on the target.
	 */
	forceExecution: boolean;
}

const defaultOptions: DeliveryOptions = {
	requestReceipt: false,
	resendOnFailure: false,
	forceExecution: false
};

function sendTC(command: string): void {
	console.log('Send telecommand: ' + command);
}

export function Widget() {
	const [command, setCommand] = useState('default-command');

	const handle = () => {
		showDialog('custom-tc', {
			title: 'Send telecommand',
			content:
				'Are you sure you want to send the telecommand "' + command + '"?',
			initialState: undefined
		}).then(() => sendTC(command));
	};

	return (
		<View padding="size-200">
			<Flex direction="column" gap="size-100">
				<TextField
					label="Telecommand"
					width="100%"
					value={command}
					onChange={setCommand}
				/>
				<ActionButton onPress={handle}>Send</ActionButton>
			</Flex>
		</View>
	);
}
```

This also creates default delivery options which you'll use later as initial
value in the React state.

Now update your `sendTC` placeholder function to accept the delivery options you
defined before:

```typescript title='widget.tsx'
import { useState } from 'react';
import { ActionButton, Flex, TextField, View } from '@adobe/react-spectrum';
import { showDialog } from '@wuespace/telestion-client-common';

interface DeliveryOptions {
	/**
	 * Request a transmission receipt from the target.
	 */
	requestReceipt: boolean;
	/**
	 * Resend the telecommand if a failure has happened during transmission.
	 */
	resendOnFailure: boolean;
	/**
	 * Force the telecommand to be executed on the target.
	 */
	forceExecution: boolean;
}

const defaultOptions: DeliveryOptions = {
	requestReceipt: false,
	resendOnFailure: false,
	forceExecution: false
};

function sendTC(command: string, options: DeliveryOptions): void {
	console.log('Send telecommand:', command, ', with options:', options);
}

export function Widget() {
	const [command, setCommand] = useState('default-command');

	const handle = () => {
		showDialog('custom-tc', {
			title: 'Send telecommand',
			content:
				'Are you sure you want to send the telecommand "' + command + '"?',
			initialState: undefined
		}).then(() => sendTC(command));
	};

	return (
		<View padding="size-200">
			<Flex direction="column" gap="size-100">
				<TextField
					label="Telecommand"
					width="100%"
					value={command}
					onChange={setCommand}
				/>
				<ActionButton onPress={handle}>Send</ActionButton>
			</Flex>
		</View>
	);
}
```

## Step 2: Add state for storing the delivery options

To pass the user defined delivery options to your external telecommand API, you
need another React state which stores them. Then, you can pass these options to
the `sendTC` function in the resolved promise:

```typescript title='widget.tsx'
import { useState } from 'react';
import { ActionButton, Flex, TextField, View } from '@adobe/react-spectrum';
import { showDialog } from '@wuespace/telestion-client-common';

interface DeliveryOptions {
	/**
	 * Request a transmission receipt from the target.
	 */
	requestReceipt: boolean;
	/**
	 * Resend the telecommand if a failure has happened during transmission.
	 */
	resendOnFailure: boolean;
	/**
	 * Force the telecommand to be executed on the target.
	 */
	forceExecution: boolean;
}

const defaultOptions: DeliveryOptions = {
	requestReceipt: false,
	resendOnFailure: false,
	forceExecution: false
};

function sendTC(command: string, options: DeliveryOptions): void {
	console.log('Send telecommand:', command, ', with options:', options);
}

export function Widget() {
	const [options, setOptions] = useState(defaultOptions);
	const [command, setCommand] = useState('default-command');

	const handle = () => {
		showDialog('custom-tc', {
			title: 'Send telecommand',
			content:
				'Are you sure you want to send the telecommand "' + command + '"?',
			initialState: undefined
		}).then(() => sendTC(command, options));
	};

	return (
		<View padding="size-200">
			<Flex direction="column" gap="size-100">
				<TextField
					label="Telecommand"
					width="100%"
					value={command}
					onChange={setCommand}
				/>
				<ActionButton onPress={handle}>Send</ActionButton>
			</Flex>
		</View>
	);
}
```

## Step 3: Add an action button for the options dialog

Right now, the user cannot change the delivery options through the widget. To
change that, you need another action button which triggers a dialog that present
the current selection to the user.

Place it beside the telecommand text field:

```typescript title='widget.tsx'
import { useState } from 'react';
import { ActionButton, Flex, TextField, View } from '@adobe/react-spectrum';
import { showDialog } from '@wuespace/telestion-client-common';

interface DeliveryOptions {
	/**
	 * Request a transmission receipt from the target.
	 */
	requestReceipt: boolean;
	/**
	 * Resend the telecommand if a failure has happened during transmission.
	 */
	resendOnFailure: boolean;
	/**
	 * Force the telecommand to be executed on the target.
	 */
	forceExecution: boolean;
}

const defaultOptions: DeliveryOptions = {
	requestReceipt: false,
	resendOnFailure: false,
	forceExecution: false
};

function sendTC(command: string, options: DeliveryOptions): void {
	console.log('Send telecommand:', command, ', with options:', options);
}

export function Widget() {
	const [options, setOptions] = useState(defaultOptions);
	const [command, setCommand] = useState('default-command');

	const handle = () => {
		showDialog('custom-tc', {
			title: 'Send telecommand',
			content:
				'Are you sure you want to send the telecommand "' + command + '"?',
			initialState: undefined
		}).then(() => sendTC(command, options));
	};

	return (
		<View padding="size-200">
			<Flex direction="column" gap="size-100">
				<Flex direction="row" gap="size-100" alignItems="end">
					<TextField
						label="Telecommand"
						width="100%"
						value={command}
						onChange={setCommand}
					/>
					<ActionButton flexShrink={0}>Options</ActionButton>
				</Flex>
				<ActionButton onPress={handle}>Send</ActionButton>
			</Flex>
		</View>
	);
}
```

This wraps the existing text field in another flex container with the new action
button and aligns them horizontally. Give the action button a flex shrink of `0`
so it doesn't collapse in the flex container. Add some spacing between both
items with `gap="size-100"` and align them with `alignItems="end"` in the flex
container. This puts the action button on the same height as the text field
input.

Now, your widget should look like this:

<Image
	src="/img/dialogs/stateful-dialog-layout.png"
	alt="The custom telecommand widget with the options button"
	center
/>

## Step 4: Open the options dialog

Now, the added action button does nothing. Attach an event handler that opens
the dialog which presents the delivery options to the user:

```typescript title='widget.tsx'
import { useState } from 'react';
import { ActionButton, Flex, TextField, View } from '@adobe/react-spectrum';
import { showDialog } from '@wuespace/telestion-client-common';

interface DeliveryOptions {
	/**
	 * Request a transmission receipt from the target.
	 */
	requestReceipt: boolean;
	/**
	 * Resend the telecommand if a failure has happened during transmission.
	 */
	resendOnFailure: boolean;
	/**
	 * Force the telecommand to be executed on the target.
	 */
	forceExecution: boolean;
}

const defaultOptions: DeliveryOptions = {
	requestReceipt: false,
	resendOnFailure: false,
	forceExecution: false
};

function sendTC(command: string, options: DeliveryOptions): void {
	console.log('Send telecommand:', command, ', with options:', options);
}

export function Widget() {
	const [options, setOptions] = useState(defaultOptions);
	const [command, setCommand] = useState('default-command');

	const onOptions = () => {
		showDialog('options-tc', {
			title: 'Telecommand options',
			content: 'TODO',
			initialState: options
		}).then(setOptions);
	};

	const onSend = () => {
		showDialog('custom-tc', {
			title: 'Send telecommand',
			content:
				'Are you sure you want to send the telecommand "' + command + '"?',
			initialState: undefined
		}).then(() => sendTC(command, options));
	};

	return (
		<View padding="size-200">
			<Flex direction="column" gap="size-100">
				<Flex direction="row" gap="size-100" alignItems="end">
					<TextField
						label="Telecommand"
						width="100%"
						value={command}
						onChange={setCommand}
					/>
					<ActionButton flexShrink={0} onPress={onOptions}>
						Options
					</ActionButton>
				</Flex>
				<ActionButton onPress={onSend}>Send</ActionButton>
			</Flex>
		</View>
	);
}
```

This creates a new event handler called `onOptions` which opens the options
dialog. The new dialog receives the current options as initial state and sets
the "global" options state via the setter when it succeeds.

## Step 5: Make the options dialog interactive

The dialog has no content which can interact with the dialog state. Define the
dialog's content:

```typescript title='widget.tsx'
import { useState } from 'react';
import { ActionButton, Flex, TextField, View } from '@adobe/react-spectrum';
import { showDialog } from '@wuespace/telestion-client-common';

interface DeliveryOptions {
	/**
	 * Request a transmission receipt from the target.
	 */
	requestReceipt: boolean;
	/**
	 * Resend the telecommand if a failure has happened during transmission.
	 */
	resendOnFailure: boolean;
	/**
	 * Force the telecommand to be executed on the target.
	 */
	forceExecution: boolean;
}

const defaultOptions: DeliveryOptions = {
	requestReceipt: false,
	resendOnFailure: false,
	forceExecution: false
};

function sendTC(command: string, options: DeliveryOptions): void {
	console.log('Send telecommand:', command, ', with options:', options);
}

export function Widget() {
	const [options, setOptions] = useState(defaultOptions);
	const [command, setCommand] = useState('default-command');

	const onOptions = () => {
		showDialog('options-tc', {
			title: 'Telecommand options',
			content: (state, setState) => <div>TODO</div>,
			initialState: options
		}).then(setOptions);
	};

	const onSend = () => {
		showDialog('custom-tc', {
			title: 'Send telecommand',
			content:
				'Are you sure you want to send the telecommand "' + command + '"?',
			initialState: undefined
		}).then(() => sendTC(command, options));
	};

	return (
		<View padding="size-200">
			<Flex direction="column" gap="size-100">
				<Flex direction="row" gap="size-100" alignItems="end">
					<TextField
						label="Telecommand"
						width="100%"
						value={command}
						onChange={setCommand}
					/>
					<ActionButton flexShrink={0} onPress={onOptions}>
						Options
					</ActionButton>
				</Flex>
				<ActionButton onPress={onSend}>Send</ActionButton>
			</Flex>
		</View>
	);
}
```

Here comes the trick: Instead of using strings or static components as content,
you give the dialog a function that returns the content. This function receives
from the dialog the current dialog state (here called `state`) and as second
argument a function to change it (here called `setState`).

Now, define the layout in the dialogs center part:

```typescript title='widget.tsx'
import { useState } from 'react';
import { ActionButton, Flex, TextField, View } from '@adobe/react-spectrum';
import { showDialog } from '@wuespace/telestion-client-common';

interface DeliveryOptions {
	/**
	 * Request a transmission receipt from the target.
	 */
	requestReceipt: boolean;
	/**
	 * Resend the telecommand if a failure has happened during transmission.
	 */
	resendOnFailure: boolean;
	/**
	 * Force the telecommand to be executed on the target.
	 */
	forceExecution: boolean;
}

const defaultOptions: DeliveryOptions = {
	requestReceipt: false,
	resendOnFailure: false,
	forceExecution: false
};

function sendTC(command: string, options: DeliveryOptions): void {
	console.log('Send telecommand:', command, ', with options:', options);
}

export function Widget() {
	const [options, setOptions] = useState(defaultOptions);
	const [command, setCommand] = useState('default-command');

	const onOptions = () => {
		showDialog('options-tc', {
			title: 'Telecommand options',
			content: (state, setState) => (
				<Flex direction="column" gap="size-100">
					<Checkbox
						isSelected={state.requestReceipt}
						onChange={requestReceipt => setState({ requestReceipt })}
					>
						Request a transmission receipt from the target
					</Checkbox>
					<Checkbox
						isSelected={state.resendOnFailure}
						onChange={resendOnFailure => setState({ resendOnFailure })}
					>
						Resend the telecommand if a failure has happened during transmission
					</Checkbox>
					<Checkbox
						isSelected={state.forceExecution}
						onChange={forceExecution => setState({ forceExecution })}
					>
						Force telecommand execution on the target
					</Checkbox>
				</Flex>
			),
			initialState: options
		}).then(setOptions);
	};

	const onSend = () => {
		showDialog('custom-tc', {
			title: 'Send telecommand',
			content:
				'Are you sure you want to send the telecommand "' + command + '"?',
			initialState: undefined
		}).then(() => sendTC(command, options));
	};

	return (
		<View padding="size-200">
			<Flex direction="column" gap="size-100">
				<Flex direction="row" gap="size-100" alignItems="end">
					<TextField
						label="Telecommand"
						width="100%"
						value={command}
						onChange={setCommand}
					/>
					<ActionButton flexShrink={0} onPress={onOptions}>
						Options
					</ActionButton>
				</Flex>
				<ActionButton onPress={onSend}>Send</ActionButton>
			</Flex>
		</View>
	);
}
```

Every option gets an own checkbox which shows the current state of the specific
option. When the user presses on the checkbox, the checkbox emits an event which
changes the specific option while leaving the rest of the dialog state
untouched.

This comes from the nature of the `setState` function. It accepts a new partial
dialog state (e.g. one specific `boolean` value like in this tutorial) and
shallow merges it with current state. In the end, the changes "win" but the
other values remain intact.

To wrap it up:

1. the dialog receives the "global" options state
2. the dialog it opens
3. the dialog content receives the dialog state (which is equal to the "global"
   state) and renders
4. the user changes something
5. the dialog content changes the dialog state through the given function
6. the dialog state diverts from the "global" state
7. the user accepts the changes
8. the promise resolves and returns the dialog state (which is still diverged)
9. the promise handler updates the "global" options state

!!!tip "Tip: Dynamic content"
	Not only the `content` property can receive the dialog state, but also every other property in the dialog configuration, which defines the dialog layout.

	Take a look and the API definition of the `showDialog` function for further information.

Now, press the "Options" button in your widget and change some delivery options:

<Image
	src="/img/dialogs/stateful-dialog-options-dialog.png"
	alt="The open options dialog from the custom telecommand widget"
	center
/>

The send a new telecommand and look in the development console of your browser:

<Image
	src="/img/dialogs/stateful-dialog-dev-console.png"
	alt="Console log of send API"
	center
/>

## Next steps

<!-- Short concluding sentence: -->

That's it. You've created your first stateful dialog.

Due to the usage of the `showDialog` function, you also can add modals in other
parts of the web client.

As mentioned, you should take a look at the API reference of the dialog
function:

<!-- Links to next steps/related articles -->

[//]: # (<Reference to="https://wuespace.github.io/telestion-client/@wuespace/telestion-client-common/#showDialog">)

[//]: # (	<code>showDialog</code> API reference)

[//]: # (</Reference>)

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
