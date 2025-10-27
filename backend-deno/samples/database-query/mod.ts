import { startService } from "jsr:@wuespace/telestion";
import { z } from "npm:zod";
import { InfluxDB } from "npm:@influxdata/influxdb-client@^1.35.0";

const { messageBus, config, serviceName } = await startService();

const {
  INFLUXDB_URL,
  INFLUXDB_TOKEN,
  INFLUXDB_ORG,
  INFLUXDB_BUCKET,
  QUERY_SUBJECT,
} = z.object({
  INFLUXDB_URL: z.string().url(),
  INFLUXDB_TOKEN: z.string(),
  INFLUXDB_ORG: z.string(),
  INFLUXDB_BUCKET: z.string(),
  QUERY_SUBJECT: z.string(),
}).parse(config);

console.log("Database query service started with config", {
  INFLUXDB_URL,
  INFLUXDB_ORG,
  INFLUXDB_BUCKET,
  QUERY_SUBJECT,
});

// Initialize InfluxDB client
const influxDB = new InfluxDB({
  url: INFLUXDB_URL,
  token: INFLUXDB_TOKEN,
});

const queryApi = influxDB.getQueryApi(INFLUXDB_ORG);

console.log("Listening for queries on", QUERY_SUBJECT);

// Subscribe to query requests
const querySubscription = messageBus.subscribe(QUERY_SUBJECT, {
  queue: serviceName,
});

try {
  for await (const msg of querySubscription) {
    try {
      // Parse the query request
      const textDecoder = new TextDecoder();
      const requestString = textDecoder.decode(msg.data);
      const queryRequest = JSON.parse(requestString);

      console.log("Received query request:", queryRequest);

      // Build Flux query based on request parameters
      let fluxQuery = "";

      if (queryRequest.query) {
        // Use custom Flux query if provided
        fluxQuery = queryRequest.query;
      } else {
        // Build query from parameters
        const {
          measurement,
          range = "-1h",
          fields = [],
          filters = {},
        } = queryRequest;

        fluxQuery = `from(bucket: "${INFLUXDB_BUCKET}")
  |> range(start: ${range})`;

        if (measurement) {
          fluxQuery += `
  |> filter(fn: (r) => r._measurement == "${measurement}")`;
        }

        if (fields.length > 0) {
          const fieldFilter = fields.map((f: string) => `r._field == "${f}"`).join(" or ");
          fluxQuery += `
  |> filter(fn: (r) => ${fieldFilter})`;
        }

        // Add custom filters
        for (const [key, value] of Object.entries(filters)) {
          if (typeof value === "string") {
            fluxQuery += `
  |> filter(fn: (r) => r.${key} == "${value}")`;
          }
        }
      }

      console.log("Executing query:", fluxQuery);

      // Execute query and collect results
      const results: Array<Record<string, unknown>> = [];

      await queryApi.queryRows(fluxQuery, {
        next(row, tableMeta) {
          const result = tableMeta.toObject(row);
          results.push(result);
        },
        error(error) {
          console.error("Query error:", error);
          throw error;
        },
        complete() {
          console.log(`Query completed with ${results.length} results`);
        },
      });

      // Send response
      const textEncoder = new TextEncoder();
      const response = textEncoder.encode(JSON.stringify({
        success: true,
        data: results,
        count: results.length,
      }));

      msg.respond(response);

      console.log(`Responded with ${results.length} results`);
    } catch (error) {
      console.error("Error processing query:", error);

      // Send error response
      const textEncoder = new TextEncoder();
      const errorResponse = textEncoder.encode(JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }));

      msg.respond(errorResponse);
    }
  }
} catch (error) {
  console.error("Error in database query service:", error);
} finally {
  console.log("Database query service stopped");
  querySubscription.drain();
}
