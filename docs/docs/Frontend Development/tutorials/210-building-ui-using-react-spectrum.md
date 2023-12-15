---
title: Building the UI using React Spectrum
# e.g., "Publishing messages to the event bus" or "Installing a dependency using npm"

description:
  The Telestion Client ecosystem uses the Adobe Spectrum Design system for its
  UI. Learn how to use the React Spectrum implementation to build your widget's
  UI.
---

In this tutorial, you'll use the React Spectrum library to build your widget's
UI. React Spectrum is a React-based implementation of Adobe's Spectrum Design
system. Spectrum Design is the design system used by
`@wuespace/telestion-client-common` library and integrates well into the other
parts of the client's UI.

!!! info "Prerequisites"
	To complete this tutorial, you should be familiar with React, TypeScript, and have a widget bootstrapped according to the [Bootstrapping a widget tutorial](../bootstrapping-a-widget).

## What you'll build

You'll build your widget's UI. It should display the connection status
(Connected / Disconnected) of three different I/O interfaces: `SAT A`, `SAT B`,
and `SAT C` and have "Reset" buttons that could, for example, trigger a
Telecommand:

<Image src="img/client/my-first-widget/04.png" center />

In this tutorial, you won't connect this to any actual data source (the event
bus) that's a part of the following tutorial.

The code you'll write looks like this:

```typescript title="src/widgets/my-new-widget/widget.tsx"
import {
	Divider,
	Flex,
	Heading,
	StatusLight,
	View,
	ActionButton
} from '@adobe/react-spectrum';

export function Widget() {
	return (
		<View padding={'size-200'} height={'100%'}>
			<Flex direction="column" width="100%">
				<Heading level={3}>Connection Status</Heading>
				<Divider size="M" marginBottom={'size-200'} />
				<Indicator system="SAT A" />
				<Indicator system="SAT B" />
				<Indicator system="SAT C" />
			</Flex>
		</View>
	);
}

function Indicator(props: { system: string }) {
	return (
		<Flex alignItems={'baseline'} gap={'size-200'}>
			<StatusLight variant="positive">{props.system} Connected</StatusLight>
			<ActionButton>Reset</ActionButton>
		</Flex>
	);
}
```

## Step 1: Build the layout

Adjust the `widget.tsx` to have a base layout for your widget's UI:

```typescript title='src/widgets/my-new-widget/widget.tsx'
// highlight-start
import { Divider, Flex, Heading, View } from '@adobe/react-spectrum';
// highlight-end

export function Widget() {
	// highlight-start
	return (
		<View padding={'size-200'} height={'100%'}>
			<Flex direction="column" width="100%">
				<Heading level={3}>Connection Status</Heading>
				<Divider size="M" marginBottom={'size-200'} />
				{/* Content goes here */}
			</Flex>
		</View>
	);
	// highlight-end
}
```

The result should look something like this:

<Image src="img/client/my-first-widget/03.png" center />

## Step 2: Add component for a system's indicator

Since you have three different systems, you'll extract their connection status
UI into one reusable `<Indicator />` component and use it for your three
different systems:

```typescript title='src/widgets/my-new-widget/widget.tsx'
import {
	Divider,
	Flex,
	Heading,
	// highlight-next-line
	StatusLight,
	View,
	// highlight-next-line
	ActionButton
} from '@adobe/react-spectrum';

export function Widget() {
	return (
		<View padding={'size-200'} height={'100%'}>
			<Flex direction="column" width="100%">
				<Heading level={3}>Connection Status</Heading>
				<Divider size="M" marginBottom={'size-200'} />
				// highlight-start
				<Indicator system="SAT A" />
				<Indicator system="SAT B" />
				<Indicator system="SAT C" />
				// highlight-end
			</Flex>
		</View>
	);
}

// highlight-start
function Indicator(props: { system: string }) {
	return (
		<Flex alignItems={'baseline'} gap={'size-200'}>
			<StatusLight variant="positive">{props.system} Connected</StatusLight>
			<ActionButton>Reset</ActionButton>
		</Flex>
	);
}
// highlight-end
```

Now, your UI has status-light indicators for the connection status of the three
different systems and reset buttons:

<Image src="img/client/my-first-widget/04.png" center />

## Next steps

<!-- Short concluding sentence: -->

You have now developed a realistic widget using the Spectrum Design system.

You should familiarize yourself with both the Spectrum Design system in general
as well as the React Spectrum implementation using Adobe's resources:

<Reference to="https://spectrum.adobe.com/">
	Adobe Spectrum Design System
</Reference>
<Reference to="https://react-spectrum.adobe.com/react-spectrum/index.html">
	React Spectrum Documentation
</Reference>

Of course, this widget, right now, doesn't reflect the actual connection status.
To change that, you'll learn how to connect this widget to the Application's
event bus using the APIs from `@wuespace/telestion-client-core` in the next
tutorial:

<!-- Links to next steps/related articles -->

<Reference to="../connecting-with-event-bus">
	Connecting the widget with the Event Bus
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
