import { startService } from "jsr:@wuespace/telestion";
import { z } from "npm:zod";
import { InfluxDB, Point } from "npm:@influxdata/influxdb-client@^1.35.0";

const { messageBus, config } = await startService();

const {
  INFLUXDB_URL,
  INFLUXDB_TOKEN,
  INFLUXDB_ORG,
  INFLUXDB_BUCKET,
  DATA_SUBJECT,
} = z.object({
  INFLUXDB_URL: z.string().url(),
  INFLUXDB_TOKEN: z.string(),
  INFLUXDB_ORG: z.string(),
  INFLUXDB_BUCKET: z.string(),
  DATA_SUBJECT: z.string().endsWith(">"),
}).parse(config);

console.log("Database service started with config", {
  INFLUXDB_URL,
  INFLUXDB_ORG,
  INFLUXDB_BUCKET,
  DATA_SUBJECT,
});

// Initialize InfluxDB client
const influxDB = new InfluxDB({
  url: INFLUXDB_URL,
  token: INFLUXDB_TOKEN,
});

const writeApi = influxDB.getWriteApi(INFLUXDB_ORG, INFLUXDB_BUCKET);
writeApi.useDefaultTags({ service: "telestion-database" });

console.log("Listening for data on", DATA_SUBJECT);

// Subscribe to data subject
const dataSubscription = messageBus.subscribe(DATA_SUBJECT);

try {
  for await (const msg of dataSubscription) {
    try {
      // Extract the measurement name from the subject
      // For example, "data.telemetry.temperature" -> "telemetry.temperature"
      const measurement = msg.subject.substring(DATA_SUBJECT.length - 1);

      // Parse the message data as JSON
      const textDecoder = new TextDecoder();
      const dataString = textDecoder.decode(msg.data);
      const data = JSON.parse(dataString);

      // Create a point for InfluxDB
      const point = new Point(measurement);

      // Handle different data structures
      if (typeof data === "object" && data !== null) {
        // Extract timestamp if present
        if (data.time || data.timestamp) {
          const timestamp = new Date(data.time || data.timestamp);
          point.timestamp(timestamp);
        }

        // Add fields to the point
        for (const [key, value] of Object.entries(data)) {
          if (
            key !== "time" && key !== "timestamp" && key !== "tags" &&
            value !== null && value !== undefined
          ) {
            if (typeof value === "number") {
              point.floatField(key, value);
            } else if (typeof value === "boolean") {
              point.booleanField(key, value);
            } else if (typeof value === "string") {
              point.stringField(key, value);
            }
          }
        }

        // Add tags if present
        if (data.tags && typeof data.tags === "object") {
          for (const [key, value] of Object.entries(data.tags)) {
            if (typeof value === "string") {
              point.tag(key, value);
            }
          }
        }

        // Write the point to InfluxDB
        writeApi.writePoint(point);
        await writeApi.flush();

        console.log(
          `Wrote data to measurement '${measurement}':`,
          data,
        );
      } else {
        console.warn(`Received non-object data for measurement '${measurement}'`);
      }
    } catch (error) {
      console.error("Error writing to database:", error);
    }
  }
} catch (error) {
  console.error("Error in database service:", error);
} finally {
  // Close the write API when the subscription ends
  await writeApi.close();
  console.log("Database service stopped");
}
