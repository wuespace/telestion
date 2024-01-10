# Latest Value Cache

A cache that stores the latest value for a given subject namespace (`[prefix].>`) and enables other services to retrieve the latest value for a given subject.

## Configuration Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `DATA_SUBJECT` | The subject namespace to cache values for. Must be of the pattern `[data-prefix].>` | (required) |
| `REQUEST_SUBJECT` | The subject to listen for requests on. Must be of the pattern `[request-prefix].>` | (required) |

Note that the `DATA_SUBJECT` and `REQUEST_SUBJECT` must be different. For each subject in the specified `DATA_SUBJECT` namespace, the latest value will be stored in the cache. Other services can then request the latest value for a given subject by publishing a message to the `REQUEST_SUBJECT` namespace with the subject to request as the message payload.

## Limitations

The cache is not persistent, so if the service is restarted, the cache will be empty.

While the service can be scaled horizontally (and requests will be load balanced across all instances), new data gets handled by all instances.

This could be improved by using a distributed cache (e.g. Redis).
