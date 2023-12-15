---
tags: [ Deployment, Local ]
---

# Deploying TypeScript services

## Deploying a single service

(coming soon)

## Deploying multiple services using the process manager `pup`

The process manager `pup` is a tool that can be used to run multiple services at once without having to manually start each service. It also makes it easy to manage the running services.

### Installing `pup`

Install `pup` using the following command:

```bash
deno install -Afr https://deno.land/x/pup/pup.ts
```

### Configuring `pup`

In your project's root directory, create a file called `pup.jsonc` with the following contents:

```json
{
  "services": [
    {
      "name": "service1",
      "command": "deno run --allow-net --allow-env service1.ts",
      "env": {
        "SERVICE_NAME": "service1",
        "NATS_URL": "nats://localhost:4222",
        "NATS_USER": "service",
        "NATS_PASSWORD": "service"
      }
    },
    {
      "name": "service2",
      "command": "deno run --allow-net --allow-env service2.ts",
      "env": {
        "SERVICE_NAME": "service1",
        "NATS_URL": "nats://localhost:4222",
        "NATS_USER": "service",
        "NATS_PASSWORD": "service"
      }
    }
  ]
}
```

### Running `pup`

Run `pup` using the following command:

```bash
pup -c pup.jsonc run
```

This will start the pup runner. To start the services, run the following command:

```bash
pup -c pup.jsonc start all
```

!!! tip
    If you want to have a service starting immediately after the runner starts, you can add `"autostart": true` to that service's configuration.

To stop the services, run the following command:

```bash
pup -c pup.jsonc stop all
```

!!! tip
    You can also stop a single service by specifying its name instead of `all`.

You can get the status of the services using the following command:

```bash
pup -c pup.jsonc status
```

!!! tip "Tip: Running NATS through `pup`"
    You can even run NATS through `pup`. Just add the following service to your `pup.jsonc` file:

    ```json
    {
      "name": "nats",
      "command": "nats-server -c <path-to-config-file>",
      "env": {}
    }
    ```

You can find more information about `pup` on their [documentation page](https://hexagon.github.io/pup/){target=_blank}.
