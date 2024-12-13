import { startService } from "jsr:@wuespace/telestion";

const disableNats = Deno.env.get("X_DISABLE_NATS") === "1";

const result: {
  /**
   * Whether the service has been started successfully.
   */
  started: boolean;
  /**
   * Whether the NATS API is available.
   */
  nats_api_available: boolean;
  /**
   * Whether the service is connected to the NATS server.
   */
  nats_connected: boolean;
  /**
   * The configuration of the service.
   */
  config?: Record<string, unknown>;
  /**
   * Details about an error that occurred during startup.
   */
  error?: string;
  /**
   * The environment variables of the service.
   */
  env: Record<string, string>;
} = {
  started: false,
  nats_api_available: false,
  nats_connected: false,
  env: Deno.env.toObject(),
};

try {
  if (disableNats) {
    const res = await startService({ nats: false });
    result.config = res.config; // We have a config
    result.started = true; // We have started the service
    try {
      // This should throw an error as NATS is disabled
      const nats = res.nc;
      result.nats_api_available = true;
      result.nats_connected = nats.isClosed() === false;
    } catch { /**/ }
  } else {
    const res = await startService();
    result.started = true; // We have started the service
    result.config = res.config; // We have a config

    try {
      const nats = res.nc; // This should not throw an error – NATS is enabled
      result.nats_api_available = true;
      result.nats_connected = nats.isClosed() === false;
    } catch { /**/ }
  }
} catch (e) {
  // An error occurred during startup. result.started is still false.
  // Let's add some more details about the error in case it wasn't expected.
  if (e instanceof Error) {
    result.error = e.message;
  } else {
    result.error = "Unknown error";
  }
} finally {
  // No matter what happens, the last printed line must be the JSON result string and the script must exit with code 0.
  console.log(JSON.stringify(result));
  Deno.exit(); // Important – otherwise the script will keep running
}
