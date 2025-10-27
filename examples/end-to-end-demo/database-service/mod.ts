/**
 * Database Service
 * 
 * Stores processed telemetry data for historical analysis.
 * Demonstrates Telestion service development in TypeScript/Deno.
 */

import { startService } from "jsr:@wuespace/telestion";

interface ProcessedTelemetry {
  timestamp: string;
  altitude: number;
  velocity: number;
  temperature: number;
  batteryLevel: number;
  signalStrength: number;
  processedAt: string;
  warnings: string[];
  status: string;
  distance: number;
}

// In-memory storage (in production, use a real database)
const telemetryHistory: ProcessedTelemetry[] = [];
const MAX_HISTORY = 1000;

// Start the service
const { nc, config } = await startService();

console.log("💾 Database Service started");
console.log("Configuration:", config);

const inputTopic = (config["INPUT_TOPIC"] as string) || "telemetry.processed";
const queryTopic = (config["QUERY_TOPIC"] as string) || "database.query";

console.log(`Subscribing to '${inputTopic}' for data storage`);
console.log(`Listening on '${queryTopic}' for queries`);

// Subscribe to processed telemetry for storage
const sub = nc.subscribe(inputTopic);

(async () => {
  for await (const msg of sub) {
    try {
      const data = JSON.parse(new TextDecoder().decode(msg.data)) as ProcessedTelemetry;
      
      // Store the data
      telemetryHistory.push(data);
      
      // Keep only the latest MAX_HISTORY entries
      if (telemetryHistory.length > MAX_HISTORY) {
        telemetryHistory.shift();
      }
      
      console.log(`📝 Stored telemetry: status=${data.status}, history size=${telemetryHistory.length}`);
    } catch (e) {
      console.error("❌ Error processing message:", e);
    }
  }
})();

// Handle queries for historical data
nc.subscribe(queryTopic, {
  callback: (err, msg) => {
    if (err) {
      console.error("❌ Subscription error:", err);
      return;
    }
    
    try {
      const query = JSON.parse(new TextDecoder().decode(msg.data));
      const limit = query.limit || 100;
      const status = query.status; // Optional filter by status
      
      let results = telemetryHistory;
      
      // Filter by status if specified
      if (status) {
        results = results.filter(t => t.status === status);
      }
      
      // Get the latest entries
      const data = results.slice(-limit);
      
      const response = {
        count: data.length,
        total: telemetryHistory.length,
        data: data,
      };
      
      msg.respond(new TextEncoder().encode(JSON.stringify(response)));
      
      console.log(`🔍 Query processed: limit=${limit}, status=${status || "all"}, returned=${data.length}`);
    } catch (e) {
      console.error("❌ Error processing query:", e);
      const errorResponse = { error: "Invalid query" };
      msg.respond(new TextEncoder().encode(JSON.stringify(errorResponse)));
    }
  },
});

console.log("Press Ctrl+C to stop");
