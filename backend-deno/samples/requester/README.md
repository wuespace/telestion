# Requester Sample

This sample shows how to request data from another service.

In a given frequency, the service will request the value from a given subject (with an empty request) and re-publish it on a different subject.

## Configuration Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `REQUEST_SUBJECT` | The subject to request data from. | (required) |
| `PUBLISH_SUBJECT` | The subject to publish the requested data on. | (required) |
| `FREQUENCY` | The frequency to request data from the `REQUEST_SUBJECT` in milliseconds. | `5000` |
