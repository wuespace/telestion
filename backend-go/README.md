# Telestion Service Framework for Go

[![DOI: 10.5281/zenodo.10407142](https://zenodo.org/badge/DOI/10.5281/zenodo.10407142.svg)](https://doi.org/10.5281/zenodo.10407142)
![GitHub License: MIT](https://img.shields.io/github/license/wuespace/telestion)
[![Go Reference](https://pkg.go.dev/badge/github.com/wuespace/telestion/backend.svg)](https://pkg.go.dev/github.com/wuespace/telestion/backend)

This library provides a framework for building Telestion services in Go.

## Installation

Install the library via `go get`:

```shell
go get -u github.com/wuespace/telestion/backend-go@latest
```

## Basic Usage

```go
package main

import (
	"github.com/wuespace/telestion/backend-go"
	"log"
)

type Person struct {
	Name string `json:"name"`
	Address string `json:"address"`
}

func main() {
	// start a new Telestion service
	service, err := telestion.StartService()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Service started")
	
	// publish a message on the message bus
	service.Nc.Publish("my-topic", []byte("Hello from Go!"))
	
	// subscribe to receive messages from the message bus
	// automatically unmarshal JSON message to go struct 
	_, err = service.NcJson.Subscribe("registered-person-topic", func(person *Person) {
		log.Println("Received new personal information:", person)
    })
	if err != nil {
		log.Println(err)
    }
	
	// wait for interrupts to prevent immediate shutdown of service
	telestion.WaitForInterrupt()
	
	// drain remaining messages and close connection
	if err1, err2 := service.Drain(); err1 != nil || err2 != nil {
		log.Fatal(err1, err2)
    }
}
```

## Behavior Specification

The behavior of this library is specified in
the [Behavior Specification](https://docs.telestion.wuespace.de/Backend%20Development/service-behavior/).
This specification is also used to test the library.
The source code of the tests can be found in the repository under `/backend-features`.

## License

This project is licensed under the terms of the [MIT license](LICENSE).
