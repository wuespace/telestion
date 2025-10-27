# Telestion End-to-End Demo

This example demonstrates Telestion as a complete, polyglot, microservice-based framework for mission control and ground station software.

## Architecture

This demo showcases:

- **Polyglot Architecture**: Services written in multiple languages (TypeScript/Deno, Go)
- **Microservice Pattern**: Independent services communicating via NATS message bus
- **End-to-End Integration**: From data collection to visualization

## Services

### 1. Data Generator Service (TypeScript/Deno)
Simulates telemetry data from a spacecraft/ground station.

### 2. Data Processor Service (Go)
Processes incoming telemetry data, performs calculations and validations.

### 3. Database Service (TypeScript/Deno)
Stores processed data for historical analysis.

### 4. Frontend Dashboard (React)
Visualizes real-time and historical data.

## Message Flow

```
Data Generator (TS) -> [NATS: telemetry.raw] -> Data Processor (Go)
                                                         |
                                                         v
                                    [NATS: telemetry.processed]
                                                         |
                                    +--------------------+--------------------+
                                    |                                         |
                                    v                                         v
                            Database Service (TS)                    Frontend (React)
                            [NATS: storage.save]                   [WebSocket/NATS]
```

## Running the Demo

1. Start NATS message broker:
   ```bash
   docker run -p 4222:4222 nats:latest
   ```

2. Start the services:
   ```bash
   # Terminal 1: Data Generator
   cd data-generator
   deno run --allow-net --allow-env mod.ts
   
   # Terminal 2: Data Processor
   cd data-processor
   go run main.go
   
   # Terminal 3: Database Service
   cd database-service
   deno run --allow-net --allow-env mod.ts
   
   # Terminal 4: Frontend
   cd frontend
   npm install
   npm run dev
   ```

3. Open browser to `http://localhost:5173` to see the dashboard

## Configuration

All services are configured via environment variables:

- `NATS_URL`: NATS server URL (default: `nats://localhost:4222`)
- `TC_CONFIG_*`: Service-specific configuration following Telestion conventions

## Key Features Demonstrated

1. **Polyglot Development**: Mix and match languages based on service requirements
2. **Loose Coupling**: Services only know about message subjects, not each other
3. **Scalability**: Any service can be replicated independently
4. **Resilience**: Services reconnect automatically if NATS restarts
5. **Easy Development**: Each service can be developed and tested independently
