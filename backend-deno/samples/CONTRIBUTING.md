# Deno Backend Service Samples

This directory contains samples for Deno backend service.

## Adding a new sample

To add a new sample, create a new directory under this directory. The directory
name should be the name of the sample. For example, if you want to create a
sample named `hello_world`, create a directory named `hello_world`.

Inside the directory, create a `README.md` file that describes the sample.

Most samples should also have a `mod.ts` file that contains the sample code.

### Importing the Telestion Library

To import the Telestion library, use the following import statement:

```typescript
import { startService } from "jsr:@wuespace/telestion";
```

This ensures that the import gets aliases to the repository's library files.

### Running the sample

All samples get packaged into a single docker image, based on the [`Dockerfile`](./Dockerfile) in this directory.

The `Dockerfile` gets built from the context of the [`backend-deno`](../) directory. This is done to ensure it has access to the repository's library `mod.ts` file.

To add your sample to the `docker-compose.yml` file, add the following to the `services` section:

```yaml
<service-name>:
  build:
    context: ../
    dockerfile: samples/Dockerfile
  command: ["<service-name>/mod.ts"]
  depends_on:
    - nats
  env_file:
    - .common.env
```

Replace `<service-name>` with the name of your sample. For example, if your sample is named `hello_world`, replace `<service-name>` with `hello_world`.

You then have to rebuild the docker image by running the following command from the `samples` directory:

```bash
docker compose up --build
```

## Docker Image publishing

The docker image may, in the future, be published to a docker registry.

This way, projects can easily include the samples in their `docker-compose.yml` file without having to download them locally in their projects for useful services.
