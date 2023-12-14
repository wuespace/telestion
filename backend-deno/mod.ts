import * as nats from "https://deno.land/x/nats@v1.13.0/src/mod.ts";
import { parse } from "https://deno.land/std@0.183.0/flags/mod.ts";
import { parse as parseJSON } from "https://deno.land/std@0.183.0/jsonc/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";
import { resolve } from "https://deno.land/std@0.183.0/path/mod.ts";

export const JSONCodec = nats.JSONCodec;

const flags = parse(Deno.args);

const StartServiceConfigSchema = z.object({
  nats: z.boolean().default(true),
});

export const MinimalConfigSchema = z.object({
  NATS_URL: z.string(),
  NATS_USER: z.string().optional(),
  NATS_PASSWORD: z.string().optional(),
  SERVICE_NAME: z.string(),
  DATA_DIR: z.string(),
}).passthrough();

export type MinimalConfig = z.infer<typeof MinimalConfigSchema>;

// Development mode => use default values

export type StartServiceConfig = z.infer<typeof StartServiceConfigSchema>;

/**
 * Starts the service and returns the APIs available to the Telestion service.
 * @param rawOptions The configuration for the service.
 * @param rawOptions.nats Whether to enable NATS or not. Defaults to `true`.
 *
 * @returns The APIs available to the Telestion service.
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
    rawOptions: StartServiceConfig = StartServiceConfigSchema.parse({}),
) {
  const options = StartServiceConfigSchema.parse(rawOptions);

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
    const config = MinimalConfigSchema.parse(rawConfig);
    return config;
  } catch (e) {
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
    const nc = await nats.connect({
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
