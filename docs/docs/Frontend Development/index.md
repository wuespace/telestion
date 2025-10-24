# Frontend

Processing data is only half the fun. To make the data accessible to the user, you need a frontend.

Telestion uses a frontend based on [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Bootstrap](https://getbootstrap.com/). 
Thankfully, Telestion (together with [vite](https://vitejs.dev/)) provides a lot of tools to make frontend development as easy as possible.

All you need to get started is an installation of [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/).

## Creating a new Frontend

To create a new frontend, create a new directory for it:

```bash
mkdir telestion-frontend && cd telestion-frontend
```

Now, add the following files to your directory:

### `package.json`

```json
{
  "name": "telestion-frontend",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@wuespace/telestion": "^1.0.0-alpha.4",// (1)!
    "react": "^18.2.0",
    "zod": "^3.22.4"// (2)!
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.4",
    "vite": "^7.1.7"
  }
}
```

1. Add the `@wuespace/telestion` package as a dependency. This package contains all the tools you need to get started with frontend development.
2. Add the `zod` package as a dependency. This package is used to validate any data that is sent to the frontend.

### `vite.config.ts`

```typescript
import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()/*(1)!*/],
});
```

1. Add the `react` plugin to vite. This plugin allows you to use React in your frontend.

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Telestion Frontend</title>
  </head>
  <body data-bs-theme="dark"><!-- (1)! -->
    <div id="root"></div><!-- (2)! -->
    <script type="module" src="/index.ts"></script><!-- (3)! -->
  </body>
</html>
```

1. Add the `data-bs-theme` attribute to the `body` tag. This attribute is used to set the default theme of the frontend. You can choose between `light` and `dark`.
2. Add a `div` tag with the id `root`. This is where your frontend will be rendered.
3. Add a `script` tag that loads the `index.ts` file. This file is the entry point of your frontend.

### `index.ts`

```typescript
import { initTelestion, registerWidgets } from "@wuespace/telestion"; // (1)!

import "@wuespace/telestion/telestion.css"; // (2)!

// initialize Telestion
await initTelestion/* (3)!*/({
  version: "1.0.0",// (4)!
});

// register your widget in Telestion
registerWidgets(/*...*/);// (5)! 
```

1. Import the `initTelestion` and `registerWidgets` functions from the `@wuespace/telestion` package.
2. Import the `telestion.css` file from the `@wuespace/telestion` package. This file contains all the styles (including all Bootstrap styles) you need to get started with frontend development.
3. Initialize Telestion. This sets up a basic frontend including authentication, dashboards, etc.
4. Set the version of your frontend. This is used to check if the user data needs to be migrated.
5. Register your widgets in Telestion. This is explained in more detail in the next section.

## Installing Dependencies

To install the dependencies, run the following command:

```bash
pnpm install
```

## Running the Frontend

To run the frontend, run the following command:

```bash
pnpm dlx vite
```

This will start a development server on port 5173. You can now open your browser and navigate to 
[http://localhost:5173](http://localhost:5173).

## Building the Frontend

To build the frontend, run the following command:

```bash
pnpm dlx vite build
```

## Next Steps

Now that you have a basic frontend running, you should have a look at how to add widgets to it.
