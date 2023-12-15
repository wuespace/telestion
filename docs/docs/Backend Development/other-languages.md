---
tags: [ Backend ]
---

# Using other languages

You can use any language you want to write your backend. The only requirement is that it can communicate with the NATS message bus.

## Implementation Requirements

The only technical requirement for a backend service is that it can communicate with the NATS message bus. This means that it must be able to send and receive messages on the message bus.

However, there are some additional standards that you should follow to make your service easier to use (and compliant with the Telestion ecosystem):

### Deployment

Your service should be deployable as both a Docker container and as an executable. This makes it easier to deploy and scale your service.

### Configuration

Your service should be configurable via environment variables.

Every Telestion service receives at least the following environment variables:

* `NATS_URL`: The URL of the NATS server
* `NATS_USER`: The username of the NATS user
* `NATS_PASSWORD`: The password of the NATS user
* `SERVICE_NAME`: The name of the service. This is used to create a unique queue group for your service. See [Queues](#queues) for more information.
* `DATA_DIR`: The path to the data directory. This is where your service should store any data it needs to persist. This is shared between multiple services. To ensure that your service doesn't overwrite data from other services, you should create a subdirectory for your service.

**If your service doesn't receive any of these environment variables, it should exit with a non-zero exit code.**

!!! warning
	There can be multiple instances of a service with the same name running at the same time. They are guaranteed to have the same configuration, apart from the `SERVICE_ID`. If you need a truly unique identifier, you can combine the `SERVICE_NAME` and the process ID.

### Logging

Your service should log any "feedback" to `stdout` and `stderr`.

For logging data to files, you should use the [Standard Operations Library](#standard-operations-library).

### Queues

NATS allows you to create queue groups. This means that you can have multiple instances of the same service running, and they'll share the messages they receive.

If you want to use this feature, you should use the `SERVICE_NAME` environment variable to create a unique queue group for your service.

### Message Body

Your message must be able to handle, without crashing, the following types of messages:

* JSON-encoded UTF-8 strings
* Binary data

Your service mustn't assume anything about the format or content of the message body. It must be able to handle any message body of the two types.

### Health Checks

Your service should provide a health check feature on the message bus subject `__telestion__/health`. This allows other services to check if your service is still running.

While running, any Telestion service should respond (within 0.5 seconds) to requests on the `__telestion__/health` subject with a message containing the following JSON-encoded information:

```json
{
	"errors": 0, // or number of "recent" errors
	"service": "my-service", // the SERVICE_ID
	"name": "My Service" // the SERVICE_NAME
}
```

## Standard Operations Library

!!! info
	The standard operations library is a library that provides a set of common operations that are used by many Telestion services. While it can be overwritten, every Telestion application comes with an implementation of these operations out-of-the-box that you can use.

### Data Logging

The standard operations library provides a simple way to log data to files.

To use it, publish a message to the `__telestion__/log/[category]` subject with the body you want to log. `[category]` is the category of the log message. It can be any string.

The standard operations library then logs the message to the file `logs/[category].log` in your data directory.
