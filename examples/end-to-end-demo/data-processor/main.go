package main

import (
	"encoding/json"
	"log"
	"time"

	telestion "github.com/wuespace/telestion/backend-go"
	"github.com/nats-io/nats.go"
)

const (
	// EarthRadius is the mean radius of Earth in kilometers
	EarthRadius = 6371.0
)

// TelemetryData represents raw telemetry from the spacecraft
type TelemetryData struct {
	Timestamp      string  `json:"timestamp"`
	Altitude       float64 `json:"altitude"`
	Velocity       float64 `json:"velocity"`
	Temperature    float64 `json:"temperature"`
	BatteryLevel   float64 `json:"batteryLevel"`
	SignalStrength float64 `json:"signalStrength"`
}

// ProcessedTelemetry represents validated and enriched telemetry data
type ProcessedTelemetry struct {
	TelemetryData
	ProcessedAt string   `json:"processedAt"`
	Warnings    []string `json:"warnings"`
	Status      string   `json:"status"`
	Distance    float64  `json:"distance"` // Distance from Earth's center
}

func main() {
	// Start the Telestion service
	service, err := telestion.StartService()
	if err != nil {
		log.Fatal(err)
	}
	defer service.Drain()

	log.Println("🔧 Data Processor Service started")
	log.Printf("Configuration: %v\n", service.Config)

	// Get configuration
	inputTopic := telestion.GetStringOrDefault(service.Config, "INPUT_TOPIC", "telemetry.raw")
	outputTopic := telestion.GetStringOrDefault(service.Config, "OUTPUT_TOPIC", "telemetry.processed")

	log.Printf("Subscribing to '%s', publishing to '%s'\n", inputTopic, outputTopic)

	// Subscribe to raw telemetry data
	_, err = service.Nc.Subscribe(inputTopic, func(msg *nats.Msg) {
		var data TelemetryData
		if err := json.Unmarshal(msg.Data, &data); err != nil {
			log.Printf("❌ Error parsing telemetry: %v\n", err)
			return
		}

		// Process the data
		processed := processTelemetry(data)

		// Publish processed data
		payload, err := json.Marshal(processed)
		if err != nil {
			log.Printf("❌ Error marshaling processed data: %v\n", err)
			return
		}

		if err := service.Nc.Publish(outputTopic, payload); err != nil {
			log.Printf("❌ Error publishing: %v\n", err)
			return
		}

		// Log status
		statusIcon := "✅"
		if len(processed.Warnings) > 0 {
			statusIcon = "⚠️"
		}
		log.Printf("%s Processed: status=%s, warnings=%d, alt=%.1fkm, battery=%.1f%%\n",
			statusIcon, processed.Status, len(processed.Warnings), processed.Altitude, processed.BatteryLevel)
	})

	if err != nil {
		log.Fatal(err)
	}

	log.Println("Press Ctrl+C to stop")
	telestion.WaitForInterrupt()
}

func processTelemetry(data TelemetryData) ProcessedTelemetry {
	processed := ProcessedTelemetry{
		TelemetryData: data,
		ProcessedAt:   time.Now().UTC().Format(time.RFC3339),
		Warnings:      []string{},
		Status:        "NOMINAL",
	}

	// Calculate distance from Earth's center (Earth radius + altitude)
	processed.Distance = EarthRadius + data.Altitude

	// Validate data and generate warnings
	if data.BatteryLevel < 20 {
		processed.Warnings = append(processed.Warnings, "CRITICAL: Low battery level")
		processed.Status = "CRITICAL"
	} else if data.BatteryLevel < 50 {
		processed.Warnings = append(processed.Warnings, "WARNING: Battery level below 50%")
		if processed.Status == "NOMINAL" {
			processed.Status = "WARNING"
		}
	}

	if data.Temperature < 10 || data.Temperature > 30 {
		processed.Warnings = append(processed.Warnings, "WARNING: Temperature out of nominal range")
		if processed.Status == "NOMINAL" {
			processed.Status = "WARNING"
		}
	}

	if data.SignalStrength < -75 {
		processed.Warnings = append(processed.Warnings, "WARNING: Weak signal strength")
		if processed.Status == "NOMINAL" {
			processed.Status = "WARNING"
		}
	}

	if data.Altitude < 300 || data.Altitude > 500 {
		processed.Warnings = append(processed.Warnings, "WARNING: Altitude out of nominal range")
		if processed.Status == "NOMINAL" {
			processed.Status = "WARNING"
		}
	}

	return processed
}
