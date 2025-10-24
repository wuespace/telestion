---
tags:
  - Frontend Development
  - Widgets
---

# Developing Widgets

<!-- Note about temporary docs page, will be split and improved later -->
This section provides a brief overview of how to develop custom widgets for Telestion's frontend. Widgets are reusable components that can be integrated into the Telestion dashboard to display data, visualizations, or interactive elements.

!!! note
    This is a temporary documentation page. It will be split into multiple pages and improved in the future.

## Defining Widgets

A widget is, at its core, nothing more than a JS object containing various properties that define its behavior and appearance. The required properties of a widget include:

- `id`: A unique identifier for the widget.
- `label`: A human-readable name for the widget.
- `element`: The React component that renders the widget's UI.
- `createConfig`: A function that returns the default configuration for the widget.

[See full API Reference for Widget Definition](../api#widgett){.md-button }

## Creating a Widget

Create a new TypeScript file for your widget, e.g., `MyCustomWidget.tsx`, and define your widget as follows:

```typescript
import { Widget } from '@wuespace/telestion';

export const MyCustomWidget: Widget = {
  id: 'my-custom-widget',
  label: 'My Custom Widget',
  element: <div>Hello World!</div>,
  createConfig: (oldConfig) => ({
    // Default configuration properties
  })
}
```

## Registering the Widget

To make your widget available in the Telestion dashboard, you need to register it in the widget registry. This is typically done in the main application file or a dedicated widget registration module.

If your following the guide in this documentation, update the `registerWidgets()` function at the bottom of the `index.ts` file as follows:

```typescript
import { MyCustomWidget } from './MyCustomWidget';

registerWidgets(
  MyCustomWidget,
  // other widgets...
);
```

## Interacting with the message bus

Since the library manages anything related to establishing a connection to the message bus, widgets can easily interact with it by using the provided hooks. Replace the `<div>` in your element with a new, functional react component:

```typescript
import { useNatsSubscription } from "@wuespace/telestion/auth";
import { Widget } from '@wuespace/telestion';
import React, { useState } from 'react';

function MyWidgetComponent() {
  const [latestMessage, setLatestMessage] = useState('No data yet');
  useNatsSubscription('some.subject', (msg) => {
    setLatestMessage(msg.value);
  });

  return <div>Received value: {latestMessage}</div>;
}

export const MyCustomWidget: Widget = {
  id: 'my-custom-widget',
  label: 'My Custom Widget',
  element: <MyWidgetComponent />,
  createConfig: (oldConfig) => ({
    // Default configuration properties
  })
}
```

Now, whenever a message is published to the subject `some.subject`, your widget will update and display the latest value.

Note that you can access all features of the NATS web client using the [`useNats()`](../api/#usenats) hook, which returns the NATS connection instance.

## Next Steps

[Browse Widget Samples](https://github.com/wuespace/telestion/tree/main/frontend-react/src/app/widgets){.md-button }
