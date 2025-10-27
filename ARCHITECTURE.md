# Telestion Architecture Overview

## Vision

Telestion is the **best framework for mission control and ground station software**, designed from the ground up to be:

- **Polyglot**: Write services in the best language for the job
- **Microservice-Based**: Independent, scalable services with clear responsibilities  
- **End-to-End**: Complete solution from data acquisition to visualization

## Architecture Principles

### 1. Polyglot Development

Telestion provides official SDKs for multiple languages:

- **TypeScript/Deno** (`backend-deno/`): Modern JavaScript runtime with excellent developer experience
- **Go** (`backend-go/`): High-performance, compiled language for CPU-intensive tasks
- **React** (`frontend-react/`): Modern UI framework for rich, interactive dashboards

Each service can be written in the most appropriate language for its specific requirements. All services communicate through a common message bus, making the choice of language transparent to other services.

### 2. Microservice Architecture

Services in Telestion follow microservice principles:

- **Single Responsibility**: Each service has one clear purpose
- **Loose Coupling**: Services only depend on the message bus interface
- **Independent Deployment**: Services can be updated without affecting others
- **Scalability**: Services can be replicated based on load
- **Resilience**: Failure of one service doesn't bring down the system

### 3. Message Bus Communication

All inter-service communication happens through **NATS**, a high-performance message bus:

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Service A  │────────▶│     NATS     │────────▶│  Service B  │
│   (Go)      │         │ Message Bus  │         │  (TypeScript)│
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               │
                               ▼
                        ┌─────────────┐
                        │  Service C  │
                        │  (React)    │
                        └─────────────┘
```

**Benefits:**
- Services never know about each other's implementation
- New services can be added without modifying existing ones
- Built-in pub/sub and request/reply patterns
- Automatic reconnection and reliability

### 4. Configuration Management

All Telestion services follow a consistent configuration pattern:

- Environment variables prefixed with `TC_CONFIG_*` are automatically parsed
- Each service receives its configuration as a structured object
- Standard variables like `NATS_URL` control infrastructure
- Service-specific variables control behavior

Example:
```bash
NATS_URL=nats://localhost:4222
TC_CONFIG_OUTPUT_TOPIC=telemetry.raw
TC_CONFIG_INTERVAL_MS=1000
```

### 5. End-to-End Solution

Telestion provides everything needed for ground station software:

**Backend Services:**
- Data acquisition from hardware
- Data processing and validation
- Database storage
- Authentication and authorization

**Frontend:**
- Real-time dashboards
- Historical data visualization
- User management
- Widget-based UI system

**Deployment:**
- Docker containers for easy deployment
- Docker Compose for local development
- Kubernetes-ready for production

## Example: Complete Data Flow

A typical Telestion application might have this data flow:

```
1. Hardware Interface Service (Go)
   └─▶ [NATS: telemetry.raw]
   
2. Data Validation Service (TypeScript)
   ├─▶ [NATS: telemetry.validated]
   └─▶ [NATS: alerts.critical] (if issues found)
   
3. Data Processing Service (Go)
   └─▶ [NATS: telemetry.processed]
   
4. Parallel Consumers:
   ├─▶ Database Service (TypeScript)
   │   └─▶ PostgreSQL
   ├─▶ Frontend Dashboard (React)
   │   └─▶ Real-time display
   └─▶ Alert Service (TypeScript)
       └─▶ Email/SMS notifications
```

Each service is:
- **Independent**: Can be developed, tested, and deployed separately
- **Scalable**: Can run multiple instances if needed
- **Observable**: Logs structured data for monitoring
- **Resilient**: Automatically reconnects if dependencies restart

## Getting Started

See the [examples/end-to-end-demo](examples/end-to-end-demo/README.md) for a complete working example showcasing:
- Polyglot services (TypeScript + Go)
- Microservice communication via NATS
- End-to-end data flow from generation to storage

## Why Telestion?

Compared to monolithic ground station software:

✅ **Flexibility**: Use the right language for each task
✅ **Maintainability**: Small, focused codebases
✅ **Scalability**: Scale individual components based on load
✅ **Reliability**: Isolated failures, automatic recovery
✅ **Developer Experience**: Modern tooling and languages
✅ **Team Collaboration**: Different teams can work on different services

Telestion makes it easy to build sophisticated ground station and mission control software without the complexity of traditional approaches.
