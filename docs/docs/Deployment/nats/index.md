# NATS Server Configuration

The NATS server can be configured using both a configuration file and environment variables.

## Environment Variables

The NATS server configuration is done via environment variables. The following table lists all available environment variables and their default values.

| Environment Variable | Default Value | Description                  |
|----------------------|---------------|------------------------------|
| `NATS_HOST`          | `localhost`   | The host of the NATS server. |
| `NATS_PORT`          | `4222`        | The port of the NATS server. |

## Configuration File

The NATS server can also be configured using a configuration file. To use a configuration file, you need to pass the `-c` flag to the NATS server:

```bash
nats-server -c <path-to-config-file>
```

You can find a full reference of the NATS server configuration in the [NATS documentation](https://docs.nats.io/nats-server/configuration).

For Telestion, the following settings are of special interest:

1. [`websocket`](https://docs.nats.io/running-a-nats-service/configuration/websocket/websocket_conf) - This section configures the WebSocket interface of the NATS server. It's used by the Telestion frontend to connect to the NATS server.
2. [`authorization`](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/authorization) - This section configures who can publish and subscribe to which subjects.
3. [`authorization.users`](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/username_password)  - This section configures the user accounts that can connect to the NATS server. It's used to configure the user accounts that can connect to the NATS server. As of right now, Telestion exclusively supports [username/password-based authentication](https://docs.nats.io/running-a-nats-service/configuration/securing_nats/auth_intro/username_password).

### Development Configuration

The following configuration is a good starting point for development.

!!! danger
	**Do not use this configuration in production!** It's only meant for development.

	There are several problems with this configuration that make it unsuitable for production:

	1. it doesn't use TLS for the websocket interface, meaning that all communication is unencrypted
	2. it doesn't have any authentication or authorization configured, meaning that anyone can connect to the NATS server and publish/subscribe to any subject

	**In essence, if you were to use this configuration in production, you would have a NATS server that is publicly accessible and allows anyone with access to your server to publish/subscribe to any subject!**

```json title="nats.conf"
http_port: 8222

websocket: {
	port: 9222
	no_tls: true
}
```
