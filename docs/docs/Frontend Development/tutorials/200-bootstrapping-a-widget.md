---
title: Creating your first own widget
# e.g., "Publishing messages to the event bus" or "Installing a dependency using npm"

description:
  Telestion Client projects need their custom widgets. Thankfully, the Telestion
  tooling makes it straightforward to generate new widgets. Learn how to
  bootstrap a new widget and include it in a dashboard.
---


In this tutorial, you'll generate a new widget from scratch and include it in
one of your dashboards.

!!! info "Prerequisites"
	To complete this tutorial, you should be familiar with React, TypeScript, and have a Telestion Client project that you want to work with.

If you use `npm start` within your project, you'll see a window with a login
screen:

<Image src="img/client/login.png" />

If you log in using the username `admin` and an arbitrary password (since you
haven't configured any authentication yet, you can just log in using random
credentials), you can see a dashboard with a sample widget (_Hello world_) and
some missing widgets:

<Image src="img/client/default-dashboard.png" />

## What you'll build

In this tutorial, you won't build anything fancy, but you'll learn:

1. how to bootstrap a new widget using the Telestion Client CLI
2. how to add your new widget to a dashboard
3. how to add some simple adjustments to the widget

In the end, you'll have one less _Missing widget_ message on your dashboard:

<Image src="img/client/my-first-widget/02.png" />

## Step 1: Bootstrap a new widget using the Telestion Client CLI

Within your project folder, use the `tc-cli` to automatically bootstrap a new
widget for you:

```sh
tc-cli generate widget my-first-widget
```

The result looks something like this:

```sh
$ tc-cli generate widget my-first-widget
 SUCCESS  widget-generator  Widget myFirstWidget created successfully.
 INFO     widget-generator  You can find it at src/widgets/my-first-widget.
```

This command does four things:

1. the CLI created a folder for your widget in `src/widgets/my-first-widget`,
   where the source files of your widgets can live
2. the CLI created a file `src/widgets/my-first-widget/widget.tsx` that contains
   the React component that the dashboard renders for your widget
3. the CLI created a file `src/widgets/my-first-widget/index.ts` that exports
   the component from `widget.tsx` with some metadata
4. the CLI modified the file `src/widgets/index.ts` to include your new widget
   `myFirstWidget` in the array of available widgets.

With that, you already have all the files you need and even have a working
widget. But when you look at your dashboard again, your widget isn't visible
yet.

## Step 2: Add the widget to your dashboard

To add the new widget to your dashboard, you must edit the dashboard
configuration. For that, you need a way to reference your newly created widget.

Thankfully, if you take a closer look at the `index.ts` of your new widget, you
can see that it already exports a name (`'myFirstWidget'`):

```typescript title='src/widgets/my-new-widget/index.ts'
import { Widget } from '@wuespace/telestion-client-types';
import { Widget as WidgetRenderer } from './widget';

export const widget: Widget = {
    // highlight-next-line
    name: 'myFirstWidget',
    title: 'my-first-widget',
    version: '0.0.0',
    Widget: WidgetRenderer
};
```

You can find the administrator user's dashboard's configuration in the
`src/model/sample-user-config.ts` file. Replace the second widget's `widgetName`
property with your widget name:

```typescript title='src/model/sample-user-config.ts'
import { UserConfig } from '@wuespace/telestion-client-types';

export const userConfig: UserConfig = {
    admin: {
        dashboards: [
            {
                title: 'Overview',
                columns: 4,
                rows: 4,
                widgets: [
                    {
                        id: '0',
                        widgetName: 'sampleWidget',
                        width: 4,
                        height: 1
                    },
                    {
                        id: '1',
                        // highlight-next-line
                        widgetName: 'myFirstWidget',
                        width: 2,
                        height: 2
                    },
                    // [...]
                ]
            }
        ]
    }
};
```

When you save the file and return to the client's window, it automatically
reloads the page, and you can see your widget on the left of the second row:

<Image src="img/client/my-first-widget/01.png" />

## Step 3: Add first customizations to the widget

While it's cool that you just created your first own widget, that headline
_myFirstWidget widget_ looks a bit hideous :wink:.

But since the React component within your `widget.tsx` defines your UI, you can
create whatever UI you want.

For demonstration purposes, you'll adjust the heading to something more
readable. Open the file and edit the headline to something you like:

```typescript title="src/widgets/my-first-widget/widget.tsx"
import { Heading } from '@adobe/react-spectrum';

export function Widget() {
    // highlight-next-line
    return <Heading level={2}>Hello from my first widget!</Heading>;
}
```

Once again, all you need to do is save the file, wait for a couple of seconds,
and return to the client window. Now, you should be able to see your first "own"
widget come to life:

<Image src="img/client/my-first-widget/02.png" />

## Next steps

<!-- Short concluding sentence: -->

Congratulations: you've already built your first widget. While, of course, it
doesn't look like much, yet, all you now need to do is write a "plain" React
component with the help of abstractions for communicating with the backend
Application and much more.

Even better: Telestion does all the heavy lifting in the background
(authentication, online/offline-handling, dashboard/widget configuration, etc.),
meaning you can focus on an isolated context within your widget.

<!-- Links to next steps/related articles -->

In the following tutorials, you'll take a look at how you can use the React
Spectrum library to build widgets that are consistent with the other parts of
the UI, interact with Telestion's event bus abstractions to interact with the
backend, and using a simple way of adding user configuration options to your
widget.

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
