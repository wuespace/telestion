# Database Writer Service

A service that writes time series data to InfluxDB. This service listens to messages on a configurable NATS subject and writes them to an InfluxDB bucket.

## Overview

The Database Writer Service is designed to persist telemetry and mission data for ground station operations. It automatically converts NATS messages to InfluxDB data points, making it easy to store and query time series data.

## Configuration Options

| Option | Description | Default | Required |
| ------ | ----------- | ------- | -------- |
| `INFLUXDB_URL` | The URL of the InfluxDB server (e.g., `http://influxdb:8086`) | - | Yes |
| `INFLUXDB_TOKEN` | Authentication token for InfluxDB | - | Yes |
| `INFLUXDB_ORG` | InfluxDB organization name | - | Yes |
| `INFLUXDB_BUCKET` | InfluxDB bucket name where data will be stored | - | Yes |
| `DATA_SUBJECT` | The NATS subject pattern to listen for data. Must end with `>` (e.g., `data.>`) | - | Yes |

## Data Format

The service expects JSON-formatted messages. The message structure should follow this pattern:

```json
{
  "time": "2024-01-15T10:30:00Z",  // Optional: ISO 8601 timestamp
  "value": 42.5,                     // Any field name with numeric/string/boolean value
  "status": "ok",                    // Multiple fields supported
  "tags": {                          // Optional: tags for filtering/grouping
    "location": "ground-station-1",
    "sensor": "temperature-01"
  }
}
```

### Field Types

- **Numeric values**: Stored as float fields in InfluxDB
- **Boolean values**: Stored as boolean fields in InfluxDB
- **String values**: Stored as string fields in InfluxDB
- **Timestamp**: Use `time` or `timestamp` field (ISO 8601 format)
- **Tags**: Use a `tags` object for indexed metadata

## Measurement Names

The measurement name in InfluxDB is derived from the NATS subject. For example:

- Subject: `data.telemetry.temperature`
- DATA_SUBJECT: `data.>`
- Resulting measurement: `telemetry.temperature`

This allows you to organize your data hierarchically using NATS subjects.

## Usage Example

### Environment Configuration

```env
INFLUXDB_URL=http://influxdb:8086
INFLUXDB_TOKEN=my-super-secret-token
INFLUXDB_ORG=my-organization
INFLUXDB_BUCKET=telemetry
DATA_SUBJECT=data.>
```

### Publishing Data

Other services can publish data that will be automatically stored:

```typescript
import { startService } from "jsr:@wuespace/telestion";

const { messageBus } = await startService();

// Publish temperature data
messageBus.publish(
  "data.telemetry.temperature",
  JSON.stringify({
    time: new Date().toISOString(),
    value: 23.5,
    unit: "celsius",
    tags: {
      sensor: "temp-01",
      location: "payload-bay"
    }
  })
);
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

  database:
    build:
      context: ../
      dockerfile: samples/Dockerfile
    command: ["database/mod.ts"]
    depends_on:
      - nats
      - influxdb
    env_file:
      - .common.env
    environment:
      - SERVICE_NAME=database
      - INFLUXDB_URL=http://influxdb:8086
      - INFLUXDB_TOKEN=my-super-secret-token
      - INFLUXDB_ORG=my-org
      - INFLUXDB_BUCKET=telemetry
      - DATA_SUBJECT=data.>

volumes:
  influxdb-data:
```

## Scalability

The service can be scaled horizontally - multiple instances can run simultaneously and will all process incoming data. However, be aware that:

- Each instance will write the same data, so InfluxDB should handle duplicate writes gracefully
- For production deployments, consider using a single instance or implementing deduplication logic

## Limitations

- The service requires InfluxDB v2.x (uses the Flux query language and v2 API)
- Binary data is not supported - only JSON-formatted messages
- Large messages may impact performance - consider batching for high-frequency data
