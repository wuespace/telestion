package main

import (
	"encoding/json"
	"fmt"
	. "github.com/wuespace/telestion/backend-go"
	"os"
)

func main() {
	result := Response{
		Env:           EnvArgsMap(),
		Started:       false,
		NatsAvailable: false,
		NatsConnected: false,
		Error:         "",
		Config:        nil,
	}

	service, err := StartService(WithNatsDisabledIfRequested())
	if err != nil {
		result.Error = err.Error()
		PrintResponse(&result)
		return
	}
	result.Started = true
	result.NatsAvailable = service.HasNatsAPI()
	result.NatsConnected = service.IsConnected()
	result.Config = service.Config
	PrintResponse(&result)
	return
}

type Response struct {
	Env           map[string]any `json:"env"`
	Started       bool           `json:"started"`
	NatsAvailable bool           `json:"nats_api_available"`
	NatsConnected bool           `json:"nats_connected"`
	Error         string         `json:"error,omitempty"`
	Config        map[string]any `json:"config,omitempty"`
}

func PrintResponse(response *Response) {
	jsonString, jsonErr := json.Marshal(response)
	if jsonErr != nil {
		panic(jsonErr)
	}
	fmt.Println(string(jsonString))
}

func WithNatsDisabledIfRequested() ServiceOption {
	for _, env := range os.Environ() {
		if env == "X_DISABLE_NATS=1" {
			return WithoutNats()
		}
	}
	return func(_ *Service) error {
		// no-op
		return nil
	}
}
