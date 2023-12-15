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

### Adding users

!!! info
    This guide will focus on getting you started. We'll look deeper into NATS permissions in the [NATS configuration guide](../nats/index.md).

In your NATS configuration file, add the following section:

```json
authorization {
  default_permissions = {
    publish = []
    subscribe = ["__telestion__.>"]
  }
  SERVICE = {
    publish = ["altitude", "log.>"]
    subscribe = ["altitude", "__telestion__.health"]
    allow_responses = true
  }
  users = [
    {user: service,  password: service, permissions: $SERVICE}
  ]
}
```

This will create a user called `service` with the password `service`. This user will be able to publish to the `altitude` subject and subscribe to the `__telestion__.health` subject.


