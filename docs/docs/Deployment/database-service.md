# Deploying the Central Database Service

This guide explains how to deploy the Telestion Central Database Service in your ground station infrastructure.

## Overview

The Central Database Service consists of three components:

1. **InfluxDB**: A time series database optimized for storing and querying time-stamped data
2. **Database Writer Service**: A Telestion service that writes data from the NATS message bus to InfluxDB
3. **Database Query Service**: A Telestion service that provides a query interface over the NATS message bus

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- A running NATS message bus
- Basic understanding of Telestion services

### Basic Deployment

1. Add InfluxDB to your `docker-compose.yml`:

```yaml
services:
  influxdb:
    image: influxdb:2.7
    ports:
      - "8086:8086"
    environment:
      - DOCKER_INFLUXDB_INIT_MODE=setup
      - DOCKER_INFLUXDB_INIT_USERNAME=admin
      - DOCKER_INFLUXDB_INIT_PASSWORD=your-password
      - DOCKER_INFLUXDB_INIT_ORG=your-organization
      - DOCKER_INFLUXDB_INIT_BUCKET=telemetry
      - DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=your-token
    volumes:
      - influxdb-data:/var/lib/influxdb2

volumes:
  influxdb-data:
```

2. Add the Database Writer Service:

```yaml
  database:
    image: ghcr.io/wuespace/telestion-database:latest
    depends_on:
      - nats
      - influxdb
    environment:
      - NATS_URL=nats:4222
      - SERVICE_NAME=database
      - DATA_DIR=/data
      - INFLUXDB_URL=http://influxdb:8086
      - INFLUXDB_TOKEN=your-token
      - INFLUXDB_ORG=your-organization
      - INFLUXDB_BUCKET=telemetry
      - DATA_SUBJECT=data.>
```

> [!TIP]
> To use a specific version instead of `latest`, use a version tag like `ghcr.io/wuespace/telestion-database:1.0.0`

3. Add the Database Query Service:

```yaml
  database-query:
    image: ghcr.io/wuespace/telestion-database-query:latest
    depends_on:
      - nats
      - influxdb
    environment:
      - NATS_URL=nats:4222
      - SERVICE_NAME=database-query
      - DATA_DIR=/data
      - INFLUXDB_URL=http://influxdb:8086
      - INFLUXDB_TOKEN=your-token
      - INFLUXDB_ORG=your-organization
      - INFLUXDB_BUCKET=telemetry
      - QUERY_SUBJECT=query.database
```

> [!TIP]
> To use a specific version instead of `latest`, use a version tag like `ghcr.io/wuespace/telestion-database-query:1.0.0`

4. Start the services:

```bash
docker-compose up -d
```

### Building from Source (Optional)

If you need to customize the services or prefer to build from source, you can use the following configuration instead:

```yaml
  database:
    build:
      context: ./backend-deno
      dockerfile: samples/database/Dockerfile
    # ... rest of the configuration same as above

  database-query:
    build:
      context: ./backend-deno
      dockerfile: samples/database-query/Dockerfile
    # ... rest of the configuration same as above
```

## Configuration

### Environment Variables

#### InfluxDB Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `DOCKER_INFLUXDB_INIT_MODE` | Initialization mode | `setup` |
| `DOCKER_INFLUXDB_INIT_USERNAME` | Admin username | `admin` |
| `DOCKER_INFLUXDB_INIT_PASSWORD` | Admin password | `SecurePassword123!` |
| `DOCKER_INFLUXDB_INIT_ORG` | Organization name | `my-ground-station` |
| `DOCKER_INFLUXDB_INIT_BUCKET` | Default bucket name | `telemetry` |
| `DOCKER_INFLUXDB_INIT_ADMIN_TOKEN` | API token | `my-super-secret-token` |

#### Database Writer Service Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `INFLUXDB_URL` | InfluxDB server URL | `http://influxdb:8086` |
| `INFLUXDB_TOKEN` | Authentication token | `my-super-secret-token` |
| `INFLUXDB_ORG` | Organization name | `my-ground-station` |
| `INFLUXDB_BUCKET` | Bucket to write to | `telemetry` |
| `DATA_SUBJECT` | NATS subject pattern for data | `data.>` |

#### Database Query Service Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `INFLUXDB_URL` | InfluxDB server URL | `http://influxdb:8086` |
| `INFLUXDB_TOKEN` | Authentication token | `my-super-secret-token` |
| `INFLUXDB_ORG` | Organization name | `my-ground-station` |
| `INFLUXDB_BUCKET` | Bucket to query from | `telemetry` |
| `QUERY_SUBJECT` | NATS subject for queries | `query.database` |

### Subject Patterns

The subject patterns determine how your services interact:

- **DATA_SUBJECT**: Where the writer service listens for data (e.g., `data.>` listens to all subjects starting with `data.`). The wildcard `>` allows the service to extract measurement names from the subject hierarchy.
- **QUERY_SUBJECT**: Where the query service listens for requests (e.g., `query.database`). This should be a specific subject since query parameters are passed in the message body.

## Production Deployment

### Security Considerations

1. **Use Strong Tokens**: Generate secure random tokens for `INFLUXDB_INIT_ADMIN_TOKEN`

```bash
# Generate a secure token
openssl rand -base64 32
```

2. **Change Default Password**: Never use the default password in production

3. **Network Security**: 
   - Don't expose InfluxDB port (8086) publicly
   - Use internal Docker networks
   - Consider TLS/SSL for production environments

4. **Token Management**: Store tokens in secrets management systems (e.g., Docker Secrets, Kubernetes Secrets)

### Data Persistence

Ensure InfluxDB data persists across container restarts:

```yaml
volumes:
  influxdb-data:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /path/to/persistent/storage
```

### Monitoring and Backups

1. **Monitor InfluxDB Health**:
   - Access InfluxDB UI at `http://localhost:8086`
   - Set up monitoring dashboards
   - Configure alerts for disk space and performance

2. **Regular Backups**:

```bash
# Backup InfluxDB data
docker exec influxdb influx backup /tmp/backup -t your-token
docker cp influxdb:/tmp/backup ./backup-$(date +%Y%m%d)
```

3. **Set Up Retention Policies**:

Configure data retention in InfluxDB to automatically delete old data:

```flux
// Keep data for 90 days
option task = {name: "Retention Policy", every: 1h}

from(bucket: "telemetry")
  |> range(start: -90d)
  |> drop()
```

## Scaling

### Horizontal Scaling

**Database Query Service**: Can be scaled horizontally for load balancing

```yaml
database-query:
  deploy:
    replicas: 3
```

**Database Writer Service**: Can be scaled, but all instances will write the same data

### Vertical Scaling

For high-volume data:

1. **Increase InfluxDB Resources**:

```yaml
influxdb:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 4G
```

2. **Tune InfluxDB Settings**: Configure cache sizes and compaction settings in InfluxDB config

## Kubernetes Deployment

For Kubernetes deployments, use StatefulSets for InfluxDB and Deployments for the database services:

### InfluxDB StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: influxdb
spec:
  serviceName: influxdb
  replicas: 1
  selector:
    matchLabels:
      app: influxdb
  template:
    metadata:
      labels:
        app: influxdb
    spec:
      containers:
      - name: influxdb
        image: influxdb:2.7
        env:
        - name: DOCKER_INFLUXDB_INIT_MODE
          value: "setup"
        - name: DOCKER_INFLUXDB_INIT_USERNAME
          valueFrom:
            secretKeyRef:
              name: influxdb-secrets
              key: username
        - name: DOCKER_INFLUXDB_INIT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: influxdb-secrets
              key: password
        - name: DOCKER_INFLUXDB_INIT_ORG
          value: "telestion"
        - name: DOCKER_INFLUXDB_INIT_BUCKET
          value: "telemetry"
        - name: DOCKER_INFLUXDB_INIT_ADMIN_TOKEN
          valueFrom:
            secretKeyRef:
              name: influxdb-secrets
              key: admin-token
        volumeMounts:
        - name: influxdb-data
          mountPath: /var/lib/influxdb2
  volumeClaimTemplates:
  - metadata:
      name: influxdb-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 50Gi
```

### Database Writer Service Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: database-writer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: database-writer
  template:
    metadata:
      labels:
        app: database-writer
    spec:
      containers:
      - name: database-writer
        image: ghcr.io/wuespace/telestion-database:latest
        env:
        - name: NATS_URL
          value: "nats:4222"
        - name: SERVICE_NAME
          value: "database-writer"
        - name: DATA_DIR
          value: "/data"
        - name: INFLUXDB_URL
          value: "http://influxdb:8086"
        - name: INFLUXDB_TOKEN
          valueFrom:
            secretKeyRef:
              name: influxdb-secrets
              key: admin-token
        - name: INFLUXDB_ORG
          value: "telestion"
        - name: INFLUXDB_BUCKET
          value: "telemetry"
        - name: DATA_SUBJECT
          value: "data.>"
```

### Database Query Service Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: database-query
spec:
  replicas: 3  # Can be scaled horizontally
  selector:
    matchLabels:
      app: database-query
  template:
    metadata:
      labels:
        app: database-query
    spec:
      containers:
      - name: database-query
        image: ghcr.io/wuespace/telestion-database-query:latest
        env:
        - name: NATS_URL
          value: "nats:4222"
        - name: SERVICE_NAME
          value: "database-query"
        - name: DATA_DIR
          value: "/data"
        - name: INFLUXDB_URL
          value: "http://influxdb:8086"
        - name: INFLUXDB_TOKEN
          valueFrom:
            secretKeyRef:
              name: influxdb-secrets
              key: admin-token
        - name: INFLUXDB_ORG
          value: "telestion"
        - name: INFLUXDB_BUCKET
          value: "telemetry"
        - name: QUERY_SUBJECT
          value: "query.database"
```

## Troubleshooting

### Common Issues

1. **Service Can't Connect to InfluxDB**
   - Check that InfluxDB is running: `docker ps | grep influxdb`
   - Verify network connectivity: `docker network inspect <network_name>`
   - Check InfluxDB logs: `docker logs influxdb`

2. **Authentication Errors**
   - Verify token is correct
   - Check organization and bucket names match
   - Ensure token has appropriate permissions

3. **Data Not Appearing**
   - Check Database Writer logs for errors
   - Verify DATA_SUBJECT matches your publish subjects
   - Confirm data format is valid JSON
   - Check InfluxDB UI for data

4. **Query Errors**
   - Verify Flux query syntax
   - Check that measurement names are correct
   - Ensure time range is valid

### Debug Mode

Enable debug logging:

```bash
docker logs -f database
docker logs -f database-query
```

## Example Integration

Here's a complete example showing how to integrate the database services into a Telestion application:

```typescript
// data-producer.ts - Service that generates and publishes data
import { startService } from "jsr:@wuespace/telestion";

const { messageBus } = await startService();

setInterval(() => {
  const data = {
    time: new Date().toISOString(),
    temperature: 20 + Math.random() * 10,
    pressure: 1000 + Math.random() * 100,
    tags: {
      sensor: "env-01",
      location: "payload-bay"
    }
  };
  
  messageBus.publish("data.telemetry.environment", JSON.stringify(data));
}, 1000);

// data-consumer.ts - Service that queries historical data
import { startService } from "jsr:@wuespace/telestion";

const { messageBus } = await startService();

const response = await messageBus.request(
  "query.telemetry",
  JSON.stringify({
    measurement: "telemetry.environment",
    range: "-1h",
    fields: ["temperature", "pressure"]
  })
);

const result = JSON.parse(new TextDecoder().decode(response.data));
console.log(`Retrieved ${result.count} data points`);
```

## Next Steps

- Review the [Database Writer Service README](../backend-deno/samples/database/README.md) for detailed configuration
- Review the [Database Query Service README](../backend-deno/samples/database-query/README.md) for query examples
- Explore the [InfluxDB documentation](https://docs.influxdata.com/influxdb/v2.7/) for advanced features
- Set up monitoring and alerting for your database
