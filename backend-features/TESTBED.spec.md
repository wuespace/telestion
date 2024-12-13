# Telestion Backend Service Behavior Testbed Container Specification

> [!IMPORTANT]
> The key words "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL
> NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED",  "MAY", and
"OPTIONAL" in this document are to be interpreted as described in
> [RFC 2119](https://tools.ietf.org/html/rfc2119).

## Motivation

Telestion services can be written in any language that supports the NATS protocol.
To ensure that all services have a common behavior, we use Gherkin to specify the behavior of the services.
Using an automated testing framework, we can ensure that all libraries for writing backend services behave as expected.

To enable language-independent testing, tests are designed as end-to-end tests running the service as a Docker container.

## Testbed Container

The container MUST be self-sufficient and MUST have the service executable set as `ENTRYPOINT` so that arguments (like `--dev` or
configuration overrides) MAY be passed as `CMD` (which SHALL be empty by default). The `ENTRYPOINT` MUST run a
Telestion Backend Service ("Testbed Service") that follows the specification specified in the next section.

> [!NOTE] Example
>
> ```dockerfile
> FROM denoland/deno:latest
> WORKDIR /app
> COPY . .
> ENTRYPOINT ["deno", "run", "--allow-all", "mod.ts"]
> ```

Testbed containers SHOULD do as much work as possible in the image build stage to improve testing performance as containers are recreated for each test.

## Testbed Service

The Testbed Service MUST be a Telestion Backend Service as defined in the Telestion Backend Service Behavior Specification.

The Testbed Service MUST be able to parse the following environment variables:

* `X_DISABLE_NATS` (`1` or `0`): If set to `1`, the Testbed Service SHALL be started in a non-NATS mode otherwise configurable via the service library.

The Testbed Service MUST exit with exit code `0` even if the Service itself fails to start.

The Testbed Service MUST output a single-line JSON object following the `lib/test-result.schema.json` JSON schema, as the last line printed to stdout before the service exits.

> [!NOTE] Example
>
> ```txt
> import ServiceLibrary
> 
> const [service] := new ServiceLibrary({
>     disable NATS: [X_DISABLE_NATS equals '1']
> })
> 
> print as JSON:
>     "env": Current Environment Variables { "KEY": "VALUE", ... }
>     "started": service started?
>     "error"?: error message if [service] failed to start
>     "nats_api_available": NATS API available on [service]?
>     "nats_connected": NATS connected?
>     "config"?: Configuration accessible for [service]. Undefined if not started
> ```
