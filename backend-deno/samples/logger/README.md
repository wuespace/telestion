# Logger Sample Service

This sample service demonstrates how to use the Telestion library to create a simple logger service.

It's equivalent to the [example in the documentation](https://docs.telestion.wuespace.de/Backend%20Development/typescript/e2e-log-service/).

## Functionality Description

Logs all messages received on any "sub-subject" of `log.>`. For example, if a message is received on `log.info`, it will be logged. If a message is received on `log.debug`, it will also be logged.

Messages get logged on both the console and to a local file.
