---
tags: [ Deployment, Local ]
---

# Deploying NATS

NATS isn't complicated to deploy. This guide will show you how to deploy NATS locally.

## Installing NATS

Download the NATS server from the [NATS download page](https://nats.io/download/).

## Running NATS

Run the NATS server with the following command:

```bash
nats-server
```

## Configuring NATS

NATS can be configured using a configuration file. To run NATS with a configuration file, use the following command:

```bash
nats-server -c <path-to-config-file>
```

As a starting point, you can use the following configuration to enable everything you need while developing:

```json title="nats.conf"
http_port: 8222

websocket: {
     port: 9222
     no_tls: true
}
```

This will create a user called `nats` with the password `nats`. It will also enable the HTTP and WebSocket interfaces.

Note that for production deployments, you need to configure NATS to use TLS and set up proper authentication. You can learn more about configuring NATS in the [NATS configuration guide](../nats/index.md).

[Learn more about NATS configuration](../nats/index.md){ .md-button }
