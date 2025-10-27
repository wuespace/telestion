import { startService } from "jsr:@wuespace/telestion";
import { z } from "npm:zod";

const { messageBus, config } = await startService();

const { INFLUXDB_BUCKET = "telemetry" } = z.object({
  INFLUXDB_BUCKET: z.string().default("telemetry"),
}).parse(config);

console.log("Database test client started");
console.log("Using InfluxDB bucket:", INFLUXDB_BUCKET);

// Test 1: Publish some test data
console.log("\n=== Test 1: Publishing sample data ===");
for (let i = 0; i < 5; i++) {
  const data = {
    time: new Date().toISOString(),
    temperature: 20 + Math.random() * 10,
    pressure: 1000 + Math.random() * 100,
    humidity: 40 + Math.random() * 30,
    tags: {
      sensor: "env-sensor-01",
      location: "payload-bay",
      mission: "test-mission",
    },
  };

  messageBus.publish("data.telemetry.environment", JSON.stringify(data));
  console.log(`Published data point ${i + 1}:`, data);
  await new Promise((resolve) => setTimeout(resolve, 500));
}

// Wait a bit for data to be written to database
console.log("\nWaiting 2 seconds for data to be written...");
await new Promise((resolve) => setTimeout(resolve, 2000));

// Test 2: Query the data back
console.log("\n=== Test 2: Querying data ===");
try {
  const queryRequest = {
    measurement: "telemetry.environment",
    range: "-5m",
    fields: ["temperature", "pressure", "humidity"],
  };

  console.log("Sending query:", queryRequest);

  const response = await messageBus.request(
    "query.telemetry",
    JSON.stringify(queryRequest),
    { timeout: 5000 },
  );

  const result = JSON.parse(new TextDecoder().decode(response.data));

  if (result.success) {
    console.log(`✓ Query successful! Retrieved ${result.count} data points`);
    console.log("Sample data points:", result.data.slice(0, 3));
  } else {
    console.error("✗ Query failed:", result.error);
  }
} catch (error) {
  console.error("✗ Query request failed:", error);
}

// Test 3: Query with filters
console.log("\n=== Test 3: Querying with filters ===");
try {
  const queryRequest = {
    measurement: "telemetry.environment",
    range: "-5m",
    fields: ["temperature"],
    filters: {
      sensor: "env-sensor-01",
    },
  };

  console.log("Sending filtered query:", queryRequest);

  const response = await messageBus.request(
    "query.telemetry",
    JSON.stringify(queryRequest),
    { timeout: 5000 },
  );

  const result = JSON.parse(new TextDecoder().decode(response.data));

  if (result.success) {
    console.log(
      `✓ Filtered query successful! Retrieved ${result.count} data points`,
    );
  } else {
    console.error("✗ Filtered query failed:", result.error);
  }
} catch (error) {
  console.error("✗ Filtered query request failed:", error);
}

// Test 4: Custom Flux query
console.log("\n=== Test 4: Custom Flux query (average) ===");
try {
  const queryRequest = {
    query: `from(bucket: "${INFLUXDB_BUCKET}")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "telemetry.environment")
  |> filter(fn: (r) => r._field == "temperature")
  |> mean()`,
  };

  console.log("Sending custom Flux query");

  const response = await messageBus.request(
    "query.telemetry",
    JSON.stringify(queryRequest),
    { timeout: 5000 },
  );

  const result = JSON.parse(new TextDecoder().decode(response.data));

  if (result.success) {
    console.log(
      `✓ Custom query successful! Retrieved ${result.count} results`,
    );
    console.log("Average temperature:", result.data);
  } else {
    console.error("✗ Custom query failed:", result.error);
  }
} catch (error) {
  console.error("✗ Custom query request failed:", error);
}

console.log("\n=== All tests completed ===");
await messageBus.drain();
