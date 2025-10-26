# Database Test Client

A simple test client to verify the Database Writer and Database Query services are working correctly.

## Purpose

This service tests the complete database workflow:
1. Publishes sample telemetry data
2. Queries the data back using simple parameter-based queries
3. Tests filtered queries
4. Tests custom Flux queries

## Usage

### With Docker Compose

Add this service to your `docker-compose.yml` (it will run the tests once and exit):

```yaml
database-test-client:
  build:
    context: ../
    dockerfile: samples/Dockerfile
  command: ["database-test-client/mod.ts"]
  depends_on:
    - nats
    - influxdb
    - database
    - database-query
  env_file:
    - .common.env
  environment:
    - SERVICE_NAME=database-test-client
```

### Standalone

```bash
cd backend-deno/samples
deno run --allow-all database-test-client/mod.ts --dev
```

## Expected Output

The test client will:
1. Publish 5 data points with temperature, pressure, and humidity readings
2. Wait 2 seconds for data to be written
3. Query all data from the last 5 minutes
4. Query filtered data (by sensor tag)
5. Execute a custom Flux query to calculate average temperature

You should see output indicating successful queries with data counts.
