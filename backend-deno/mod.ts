import * as nats from "https://deno.land/x/nats@v1.13.0/src/mod.ts";
import {parse} from "https://deno.land/std@0.183.0/flags/mod.ts";
import {parse as parseJSON} from "https://deno.land/std@0.183.0/jsonc/mod.ts";
import {z} from "https://deno.land/x/zod@v3.21.4/mod.ts";
import {resolve} from "https://deno.land/std@0.183.0/path/mod.ts";

let args = Deno.args;
let natsModule = nats;

/**
 * The NATS `JSONCodec`, re-exported for convenience.
 * 
 * See https://docs.nats.io/using-nats/developer/receiving/structure for details.
 * 
 * @example Encoding data into a `Uint8Array` to publish it to NATS
 * ```ts
 * import {JSONCodec} from "https://deno.land/x/telestion/mod.ts";
 * 
 * const codec = JSONCodec();
 * 
 * const encoded = codec.encode({foo: "bar"});
 * console.log(encoded); // Uint8Array(13)
 * ```
 * 
 * @example Decoding a `Uint8Array` received from NATS
 * ```ts
 * import {JSONCodec} from "https://deno.land/x/telestion/mod.ts";
 * 
 * const codec = JSONCodec();
 * 
 * const decoded = codec.decode(msg.data);
 * console.log(decoded); // {foo: "bar"}
 * ```
 */
export const JSONCodec = nats.JSONCodec;

const StartServiceConfigSchema = z.object({
  nats: z.boolean().default(true),
  overwriteArgs: z.array(z.string()).optional(),
  natsMock: z.unknown().optional(),
});

/**
 * The minimal configuration for a Telestion service. Gets used internally by {@link startService}.
 * 
 * See {@link MinimalConfig} for details about the resulting configuration object.
 * 
 * @example Manually parsing the configuration
 * ```ts
 * import {MinimalConfigSchema} from "https://deno.land/x/telestion/mod.ts";
 * 
 * const rawConfig: unknown = Deno.env.toObject();
 * 
 * const config = MinimalConfigSchema.parse(rawConfig);
 * console.log(config.SERVICE_NAME); // "my-service"
 * ```
 */
export const MinimalConfigSchema = z.object({
  NATS_URL: z.string(),
  NATS_USER: z.string().optional(),
  NATS_PASSWORD: z.string().optional(),
  SERVICE_NAME: z.string(),
  DATA_DIR: z.string(),
}).passthrough();

/**
 * The minimal configuration for a Telestion service. Returned as `config` property by {@link startService}.
 * 
 * ### Properties
 * - `NATS_URL: string` The URL of the NATS server.
 * - `NATS_USER?: string` The username for the NATS server.
 * - `NATS_PASSWORD?: string` The password for the NATS server.
 * - `SERVICE_NAME: string` The name of the service.
 * - `DATA_DIR: string` The path to the data directory.
 * 
 * Can also contain additional properties under `MinimalConfig[key: string]: unknown`.
 */
export type MinimalConfig = z.infer<typeof MinimalConfigSchema>;

// Development mode => use default values

/**
 * Options passed to the {@link startService} function.
 * 
 * ### Properties
 * - `nats: boolean = true` Whether to enable NATS or not. Disabling NATS can be useful during development.
 * - `overwriteArgs?: string[]` An array of arguments that should overwrite the CLI arguments. Useful for testing.
 * - `natsMock?: unknown` A mock for the NATS module. Useful for testing.
 * 
 * @see {@link startService}
 */
export type StartServiceConfig = z.infer<typeof StartServiceConfigSchema>;

/**
 * Starts the service and returns the APIs available to the Telestion service.

 * ### Service APIs returned by this function
 * - `nc: NATSConnection` The NATS connection object.
 * - `messageBus: MessageBus` The NATS message bus. Alias for `nc`.
 * - `dataDir: string` The path to the data directory.
 * - `serviceName: string` The name of the service.
 * - `config: MinimalConfig` The configuration of the service.

 * @param rawOptions The configuration for the service. See {@link StartServiceConfig} for details.
 *
 * @throws If the service couldn't be started.
 *
 * @example
 * ```ts
 * import {startService, JSONCodec} from "./lib.ts";
 *
 * const {nc, serviceName} = await startService();
 * console.log(`Service ${serviceName} started!`);
 *
 * nc.publish("my-topic", JSONCodec().encode({foo: "bar"}));
 * console.log("Message published!");
 *
 * await nc.drain();
 * ```
 */
export async function startService(
  rawOptions: z.input<typeof StartServiceConfigSchema> = StartServiceConfigSchema.parse({}),
) {
  const options = StartServiceConfigSchema.parse(rawOptions);
  args = options.overwriteArgs ?? Deno.args;
  natsModule = options.natsMock as typeof nats ?? nats;

  const config = assembleConfig();

  return {
    // Non-NATS APIs
    get nc(): never {
      throw new Error("NATS is not enabled");
    },
    get messageBus(): never {
      throw new Error("NATS is not enabled");
    },
    // NATS APIs
    ...(options.nats ? await initializeNats(config) : {}),
    // Other APIs
    dataDir: resolve(config.DATA_DIR),
    serviceName: config.SERVICE_NAME,
    config,
  };
}

/**
 * Assembles the configuration for the service.
 */
function assembleConfig() {
  const flags = parse(args);

  /**
   * Configuration parameters that are passed via environment variables or command line arguments.
   */
  const withoutConfigFile = z.object({
    CONFIG_FILE: z.string().optional(),
    CONFIG_KEY: z.string().optional(),
  }).passthrough().parse({
    ...getDefaultConfig(),
    ...Deno.env.toObject(),
    ...flags,
  });

  // No config file => return the parsed config
  if (!withoutConfigFile.CONFIG_FILE) {
    return ensureMinimalConfig(withoutConfigFile);
  }

  const config = parseJSON(
    Deno.readTextFileSync(withoutConfigFile.CONFIG_FILE),
  );

  // Config file doesn't contain an object => throw error
  if (typeof config !== "object" || config === null || Array.isArray(config)) {
    throw new Error("Invalid config file");
  }

  // No config key => return the parsed config combined with the root config file object
  if (!withoutConfigFile.CONFIG_KEY) {
    return ensureMinimalConfig({ ...config, ...withoutConfigFile });
  }

  const childConfig = config[withoutConfigFile.CONFIG_KEY];

  // Config key doesn't exist or doesn't lead to an object => throw error
  if (
    typeof childConfig !== "object" || childConfig === null ||
    Array.isArray(childConfig)
  ) {
    throw new Error("Invalid config file");
  }

  // Return the parsed config combined with the child config object
  return ensureMinimalConfig({ ...childConfig, ...withoutConfigFile });
}

function ensureMinimalConfig(rawConfig: unknown) {
  try {
    return MinimalConfigSchema.parse(rawConfig);
  } catch (e) {
    const flags = parse(args);
    console.error("Missing required configuration parameters.");
    console.info(`Details: ${e.message}`);

    if (!flags["dev"]) {
      console.info(
        'Run with "--dev" to use default values for missing environment variables during development.',
      );
    }
    Deno.exit(1);
  }
}

function getDefaultConfig() {
  const flags = parse(args);
  if (!flags["dev"]) {
    return {};
  }

  console.log(
    "Running in development mode. Using default values for missing environment variables.",
  );
  return {
    NATS_URL: "localhost:4222",
    SERVICE_NAME: `dev-${Deno.gid}`,
    DATA_DIR: resolve("./data"),
  };
}

async function initializeNats(config: MinimalConfig) {
  try {
    const nc = await natsModule.connect({
      servers: config.NATS_URL,
      user: config.NATS_USER,
      pass: config.NATS_PASSWORD,
    });

    // Register health check
    nc.subscribe("__telestion__.health", {
      callback: (err, msg) => {
        if (err) {
          return;
        }
        msg.respond(
          JSONCodec().encode({
            name: config.SERVICE_NAME,
          }),
        );
      },
    });
    return { nc, messageBus: nc };
  } catch (e) {
    console.error(
      `Error! Couldn't connect to the message bus. Details: ${e.message}`,
    );
    throw e;
  }
}
