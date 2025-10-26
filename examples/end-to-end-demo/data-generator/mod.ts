/**
 * Data Generator Service
 * 
 * Simulates telemetry data from a spacecraft/ground station.
 * Demonstrates Telestion service development in TypeScript/Deno.
 */

import { startService } from "jsr:@wuespace/telestion";

interface TelemetryData {
  timestamp: string;
  altitude: number;
  velocity: number;
  temperature: number;
  batteryLevel: number;
  signalStrength: number;
}

// Generate realistic telemetry data
function generateTelemetry(): TelemetryData {
  const now = new Date();
  
  // Simulate orbital motion (simplified)
  const secondsSinceMidnight = (now.getTime() / 1000) % 86400;
  const orbitPhase = (secondsSinceMidnight / 5400) * 2 * Math.PI; // 90 min orbit
  
  return {
    timestamp: now.toISOString(),
    altitude: 400 + Math.sin(orbitPhase) * 50, // 350-450 km
    velocity: 7.66 + Math.random() * 0.1, // ~7.66 km/s orbital velocity
    temperature: 20 + Math.random() * 10 - 5, // 15-25°C
    batteryLevel: 85 + Math.random() * 15, // 85-100%
    signalStrength: -60 + Math.random() * 20, // -80 to -60 dBm
  };
}

// Start the service
const { nc, config } = await startService();

console.log("🛰️  Data Generator Service started");
console.log("Configuration:", config);

const outputTopic = (config["OUTPUT_TOPIC"] as string) || "telemetry.raw";
const intervalMs = parseInt((config["INTERVAL_MS"] as string) || "1000");

console.log(`Publishing telemetry data to '${outputTopic}' every ${intervalMs}ms`);

// Generate and publish telemetry data at regular intervals
setInterval(() => {
  const data = generateTelemetry();
  const payload = JSON.stringify(data);
  
  nc.publish(outputTopic, new TextEncoder().encode(payload));
  
  console.log(`📡 Published: alt=${data.altitude.toFixed(1)}km, vel=${data.velocity.toFixed(2)}km/s, battery=${data.batteryLevel.toFixed(1)}%`);
}, intervalMs);

// Keep the service running
console.log("Press Ctrl+C to stop");
