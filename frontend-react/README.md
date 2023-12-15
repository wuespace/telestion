# Telestion Frontend Library

This library contains all the components and utilities that are used in the Telestion Frontend.

## Installation

```shell
pnpm i @wuespace/telestion
```

## Features

- An easy way to build a Telestion frontend
- Based on [Vite](https://vitejs.dev/) and [React](https://reactjs.org/)
- Using [Bootstrap](https://getbootstrap.com/) for easy styling
- one simple `initTelestion` function to initialize a Telestion frontend for minimal boilerplate
- handles the connection to the Telestion backend services

## Usage

In a Vite project, you can use the library like this:

### `index.html`

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Telestion App</title>
	</head>
	<body>
		<div id="root"></div>
		<script type="module" src="/main.ts"></script>
	</body>
</html>
```

### `main.ts`

```typescript
import { initTelestion } from '@wuespace/telestion';

import '@wuespace/telestion/telestion.css';

initTelestion({
	version: '0.1.0'
});
```

## Development

The library itself is located under `src/lib` and the demo app is located under `src/app`.

To start the demo app, run:

```shell
pnpm dev
```

To build the library, run:

```shell
pnpm build
```

To build the documentation, run:

```shell
pnpm docs
```

## License

[MIT License](./LICENSE)
