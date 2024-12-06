# Telestion Service Framework for Deno

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.10407142.svg)](https://doi.org/10.5281/zenodo.10407142)
![GitHub License](https://img.shields.io/github/license/wuespace/telestion)

This library provides a framework for building Telestion services in Deno.

## Usage

```typescript
import {startService} from 'jsr:@wuespace/telestion';

const {nc} = await startService();
```

`nc` is a `NatsConnection` instance. The library automatically handles the connection to the NATS broker.

For more information, have a look at
the [documentation](https://docs.telestion.wuespace.de/Backend%20Development/typescript/).

## Behavior Specification

The behavior of this library is specified in
the [Behavior Specification](https://docs.telestion.wuespace.de/Backend%20Development/service-behavior/).
This specification is also used to test the library.
The source code of the tests can be found in the repository under `/backend-features`.

## License

This project is licensed under the terms of the [MIT license](LICENSE).
