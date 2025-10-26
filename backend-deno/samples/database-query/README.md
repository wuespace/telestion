# Database Query Service

A service that queries time series data from InfluxDB and responds to NATS requests. This service enables other Telestion services and frontend clients to retrieve stored data.

## Overview

The Database Query Service provides a request/reply interface for querying data from InfluxDB. It supports both simple parameter-based queries and custom Flux queries, making it flexible for various use cases.

## Configuration Options

| Option | Description | Default | Required |
| ------ | ----------- | ------- | -------- |
| `INFLUXDB_URL` | The URL of the InfluxDB server (e.g., `http://influxdb:8086`) | - | Yes |
| `INFLUXDB_TOKEN` | Authentication token for InfluxDB | - | Yes |
| `INFLUXDB_ORG` | InfluxDB organization name | - | Yes |
| `INFLUXDB_BUCKET` | InfluxDB bucket name to query from | - | Yes |
| `QUERY_SUBJECT` | The NATS subject to listen for queries (e.g., `query.database` or `db.query`) | - | Yes |

## Query Request Format

### Simple Query (Parameter-Based)

```json
{
  "measurement": "telemetry.temperature",
  "range": "-1h",
  "fields": ["value"],
  "filters": {
    "sensor": "temp-01"
  }
}
```

#### Parameters

- **measurement** (optional): The measurement name to query
- **range** (optional): Time range in InfluxDB notation (e.g., `-1h`, `-24h`, `-7d`). Default: `-1h`
- **fields** (optional): Array of field names to retrieve. If empty, all fields are returned
- **filters** (optional): Object with key-value pairs for additional filtering (tags or fields)

### Custom Flux Query

For advanced use cases, you can provide a custom Flux query:

```json
{
  "query": "from(bucket: \"telemetry\") |> range(start: -1h) |> filter(fn: (r) => r._measurement == \"temperature\") |> aggregateWindow(every: 5m, fn: mean)"
}
```

## Response Format

### Successful Query

```json
{
  "success": true,
  "count": 42,
  "data": [
    {
      "_time": "2024-01-15T10:30:00Z",
      "_measurement": "telemetry.temperature",
      "_field": "value",
      "_value": 23.5,
      "sensor": "temp-01"
    },
    ...
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Invalid query syntax"
}
```

## Usage Examples

### TypeScript/Deno Service

```typescript
import { startService } from "jsr:@wuespace/telestion";

const { messageBus } = await startService();

// Request temperature data from the last hour
const response = await messageBus.request(
  "query.telemetry",
  JSON.stringify({
    measurement: "telemetry.temperature",
    range: "-1h",
    fields: ["value"],
    filters: {
      sensor: "temp-01"
    }
  })
);

const result = JSON.parse(new TextDecoder().decode(response.data));
console.log(`Received ${result.count} data points`);
console.log(result.data);
```

### Custom Flux Query Example

```typescript
const response = await messageBus.request(
  "query.telemetry",
  JSON.stringify({
    query: `
      from(bucket: "telemetry")
        |> range(start: -24h)
        |> filter(fn: (r) => r._measurement == "telemetry.temperature")
        |> aggregateWindow(every: 1h, fn: mean)
        |> yield(name: "mean")
    `
  })
);

const result = JSON.parse(new TextDecoder().decode(response.data));
console.log(`Hourly averages:`, result.data);
```

## Deployment

### Docker Compose

```yaml
services:
  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=password123
      - DOCKER_INFLUXDB_INIT_ORG=my-org
      - DOCKER_INFLUXDB_INIT_BUCKET=telemetry
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=my-super-secret-token
    volumes:
      - influxdb-data:/var/lib/influxdb2

  database-query:
    image: ghcr.io/wuespace/telestion-database-query:latest
    depends_on:
      - nats
      - influxdb
    env_file:
      - .common.env
    environment:
      - SERVICE_NAME=database-query
      - INFLUXDB_URL=http://influxdb:8086
      - INFLUXDB_TOKEN=my-super-secret-token
      - INFLUXDB_ORG=my-org
      - INFLUXDB_BUCKET=telemetry
      - QUERY_SUBJECT=query.database

volumes:
  influxdb-data:
```

**Building from Source (Alternative)**

To build from source instead of using the published image:

```yaml
  database-query:
    build:
      context: ./path/to/telestion/backend-deno
      dockerfile: samples/database-query/Dockerfile
    # ... rest of configuration
```

## Scalability

The service uses queue groups, so multiple instances can be deployed for load balancing:

- Requests are automatically distributed across available instances
- Each request is handled by exactly one instance
- Scale horizontally by increasing the number of replicas

## Query Performance Tips

1. **Use time ranges**: Always specify a `range` to limit the amount of data scanned
2. **Filter early**: Use `filters` to reduce the dataset before processing
3. **Limit fields**: Only request the fields you need using the `fields` parameter
4. **Aggregate when possible**: For large datasets, use custom Flux queries with aggregation functions

## Security Considerations

- The service requires a valid InfluxDB token with read permissions
- Validate and sanitize query inputs if exposing to untrusted clients
- Consider implementing query timeouts for complex queries
- Monitor query performance to prevent resource exhaustion

## Limitations

- Requires InfluxDB v2.x
- All results are loaded into memory before responding - very large result sets may cause issues
- No built-in pagination support - implement in your application if needed
