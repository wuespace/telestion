# Telestion Service Framework for Go

[![DOI: 10.5281/zenodo.10407142](https://zenodo.org/badge/DOI/10.5281/zenodo.10407142.svg)](https://doi.org/10.5281/zenodo.10407142)
![GitHub License: MIT](https://img.shields.io/github/license/wuespace/telestion)

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
	"log"
	"github.com/wuespace/telestion/backend-go"
)

func main() {
	// start a new Telestion service
	service, err := telestion.StartService()
	if err != nil {
		log.Fatal(err)
	}
	log.Println("Service started")

	// publish a message on the message bus
	service.Nc.Publish(service.Config["OUT"], []byte("Hello from Go!"))

	// wait for interrupts to prevent immediate shutdown of service
	telestion.WaitForInterrupt()

	// drain remaining messages and close connection
	service.Drain()
}

```

## Behavior Specification

The behavior of this library is specified in
the [Behavior Specification](https://docs.telestion.wuespace.de/Backend%20Development/service-behavior/).
This specification is also used to test the library.
The source code of the tests can be found in the repository under `/backend-features`.

## Releasing a new version

To release a new version of the Go library, a special tag has to be created next to the main release tag. For example, if the released version tag is `v1.0.0-alpha.0`, a second tag (prefixed with the subdirectory) has to be created: `backend-go/v1.0.0-alpha.0`. Otherwise, the Go package registry doesn't detect the new version.

> If a module is defined in a subdirectory within the repository, that is, the module subdirectory portion of the module path is not empty, then each tag name must be prefixed with the module subdirectory, followed by a slash. For example, the module golang.org/x/tools/gopls is defined in the gopls subdirectory of the repository with root path golang.org/x/tools. The version v0.4.0 of that module must have the tag named gopls/v0.4.0 in that repository.

-- https://go.dev/ref/mod#vcs-version

## License

This project is licensed under the terms of the [MIT license](LICENSE).
