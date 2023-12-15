---
title: Adding configuration options
# e.g., "Publishing messages to the event bus" or "Installing a dependency using npm"

description:
  Make your widget configurable and re-usable by adding configuration options
---

In this tutorial, you'll add configuration options to the widget from the
previous tutorials.

!!! info "Prerequisites"
	To complete this tutorial, you should be familiar with TypeScript and React.

	You should also have the widget's code from
	[Connecting with the event bus](/client/tutorials/connecting-with-event-bus).

## What you'll build

In this tutorial, you'll add a `isReadonly` configuration option to your widget.
You'll also add a user interface to let Ground Station Operators configure your
widget without having to adjust the code.

<Image src="img/client/my-first-widget/config-controls.gif" center />

```typescript title='src/widgets/my-first-widget/model.ts'
import { GenericProps } from '@wuespace/telestion-client-types';

/**
 * Props for the "my-first-widget" widget
 */
export interface WidgetProps extends GenericProps {
    /**
     * Whether the widget should be read-only. If `true`, the reset buttons get disabled.
     */
    isReadonly: boolean;
}
```

```typescript title='src/widgets/my-first-widget/config.tsx'
import { Checkbox, View } from '@adobe/react-spectrum';
import { BaseConfigControlsProps } from '@wuespace/telestion-client-types';
import { WidgetProps } from './model';

export function ConfigControls(props: BaseConfigControlsProps<WidgetProps>) {
    return (
        <View padding="size-200">
        <Checkbox
            isSelected={props.currentProps.isReadonly}
    onChange={isReadonly => props.onUpdate({ isReadonly })}
>
    Readonly (disable buttons)
    </Checkbox>
    </View>
);
}
```

```typescript title='src/widgets/my-first-widget/index.ts'
import { Widget } from '@wuespace/telestion-client-types';
// highlight-start
import { ConfigControls } from './config';
import { WidgetProps } from './model';
// highlight-end
import { Widget as WidgetRenderer } from './widget';

// highlight-next-line
export const widget: Widget<WidgetProps> = {
    name: 'myFirstWidget',
    title: 'my-first-widget',
    version: '0.0.0',
    Widget: WidgetRenderer,
    // highlight-next-line
    ConfigControls
};
```

## Step 1: Define the configuration options

First, you need to define a type for your configuration options.

Create a new file called `model.ts`, and export an interface `WidgetProps` with
the corresponding type:

```typescript title='src/widgets/my-first-widget/model.ts'
import { GenericProps } from '@wuespace/telestion-client-types';

/**
 * Props for the "my-first-widget" widget
 */
export interface WidgetProps extends GenericProps {
    /**
     * Whether the widget should be read-only. If `true`, the reset buttons get disabled.
     */
    isReadonly: boolean;
}
```

Update your widget's `index.ts` to define your new interface as the widget's
configuration type:

```typescript title='src/widgets/my-first-widget/index.ts'
import { Widget } from '@wuespace/telestion-client-types';
// highlight-next-line
import { WidgetProps } from './model';
import { Widget as WidgetRenderer } from './widget';

// highlight-next-line
export const widget: Widget<WidgetProps> = {
    name: 'myFirstWidget',
    title: 'my-first-widget',
    version: '0.0.0',
    Widget: WidgetRenderer
};
```

:::warning Type error in `src/widgets/index.ts` depending on `tc-cli` version

Depending on the version of `tc-cli` you're using, this might lead to a type
error in your `src/widgets/index.ts` file.

If that's the case, append `as Widget` to your widget's declaration:

```typescript title='src/widgets/index.ts'
// highlight-next-line
import { Widget } from '@wuespace/telestion-client-types';
// [...]
import { widget as myFirstWidget } from './my-first-widget';
// IMPORT_INSERT_MARK

export const projectWidgets: Widget[] = [
    // ARRAY_FIRST_ELEMENT_INSERT_MARK
    // highlight-next-line
    myFirstWidget as Widget,
    // [...]
    sampleWidget
];
```

:::

## Step 2: Adjust the widget

The props passed to your widget now have the `WidgetProps` type.

Use the props' `isReadonly` property to deactivate the action buttons if the
property's value is true:

```typescript title="src/widgets/my-first-widget/widget.tsx"
// [...]
// highlight-next-line
import { WidgetProps } from './model';

// highlight-next-line
export function Widget(props: WidgetProps) {
    return (
        <View padding={'size-200'} height={'100%'}>
    <Flex direction="column" width="100%">
    <Heading level={3}>Connection Status</Heading>
    <Divider size="M" marginBottom={'size-200'} />
    // highlight-start
    <Indicator system="SAT A" isReadonly={props.isReadonly} />
    <Indicator system="SAT B" isReadonly={props.isReadonly} />
    <Indicator system="SAT C" isReadonly={props.isReadonly} />
    // highlight-end
    </Flex>
    </View>
);
}

// highlight-next-line
function Indicator(props: { system: string; isReadonly: boolean }) {
    const broadcast = useBroadcast('reset');
    const status = useSubjectLatest(`system-status/${props.system}`) ?? false;

    return (
        <Flex alignItems={'baseline'} gap={'size-200'}>
    <StatusLight variant={status ? 'positive' : 'negative'}>
        {props.system} {status ? 'Connected' : 'Disconnected'}
    </StatusLight>
    <ActionButton
    onPress={() => broadcast({ system: props.system })}
    // highlight-next-line
    isDisabled={props.isReadonly}
        >
        Reset
        </ActionButton>
        </Flex>
);
}
```

## Step 3: Add default options to the user configuration

To make sure that the widget always gets the correct type, you need to specify
the widget usage's default configuration options in your dashboard's
declaration.

Add the `initialProps` field with `isReadonly` set to `false` to your widget's
declaration in your `sample-user-config.ts`:

```typescript title='src/model/sample-user-config.ts'
// [...]
{
    id: '1',
        widgetName: 'myFirstWidget',
    width: 2,
    height: 2,
    initialProps: {
    isReadonly: false
}
},
// [...]
```

## Step 4: Add the configuration control interface component

The `telestion-client` library makes it easy to not only make your widgets
configurable through the dashboard declaration, but also let your users adjust a
widget's configuration.

You don't have to worry about how to make this accessible to the user, all you
need to do is to define a user interface for adjusting the configuration options
and declare it.

Create a file `config.tsx` in your widget's folder and define a `ConfigControls`
component like this:

```typescript title='src/widgets/my-first-widget/config.tsx'
import { Checkbox, View } from '@adobe/react-spectrum';
import { BaseConfigControlsProps } from '@wuespace/telestion-client-types';
import { WidgetProps } from './model';

export function ConfigControls(props: BaseConfigControlsProps<WidgetProps>) {
    return (
        <View padding="size-200">
        <Checkbox
            isSelected={props.currentProps.isReadonly}
    onChange={isReadonly => props.onUpdate({ isReadonly })}
>
    Readonly (disable buttons)
    </Checkbox>
    </View>
);
}
```

The `props` contain two properties:

- `currentProps`, which is of your own `WidgetProps` type, and represents the
  current configuration
- `onUpdate(partial: Partial<WidgetProps>)`, which you can use to set the user
  configuration (comparable to the `useState()` setter function)

:::tip Partial state in `onUpdate`

The `onUpdate` function merges the partial state you pass into it with your
current state.

For example, if `currentProps` is `{ a: 1, c: 3 }` and you call
`onUpdate({ b: 2, c: 4 })`, the resulting `currentProps` are
`{ a: 1, b: 2, c: 4 }`.

:::

All you need to do now to expose these configuration controls to your users is
to declare your component in the widget's `index.ts`:

```typescript title='src/widgets/my-first-widget/index.ts'
import { Widget } from '@wuespace/telestion-client-types';
// highlight-next-line
import { ConfigControls } from './config';
import { WidgetProps } from './model';
import { Widget as WidgetRenderer } from './widget';

export const widget: Widget<WidgetProps> = {
    name: 'myFirstWidget',
    title: 'my-first-widget',
    version: '0.0.0',
    Widget: WidgetRenderer,
    // highlight-next-line
    ConfigControls
};
```

With that, your users can now open your widget's configuration page through the
widget's context menu (right mouse button):

<Image src="img/client/my-first-widget/config-controls.gif" center />

## Next steps

<!-- Short concluding sentence: -->

You now know all the basics for building Telestion Client Widgets. But there are
lots of other features the `telestion-client` APIs allow you to do. If you want,
you can just keep reading through the tutorials.

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
