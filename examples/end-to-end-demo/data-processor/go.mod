module github.com/wuespace/telestion/examples/end-to-end-demo/data-processor

go 1.23

toolchain go1.24.7

require (
	github.com/nats-io/nats.go v1.37.0
	github.com/wuespace/telestion/backend-go v0.0.0
)

require (
	github.com/klauspost/compress v1.17.11 // indirect
	github.com/nats-io/nkeys v0.4.9 // indirect
	github.com/nats-io/nuid v1.0.1 // indirect
	golang.org/x/crypto v0.31.0 // indirect
	golang.org/x/sys v0.28.0 // indirect
)

replace github.com/wuespace/telestion/backend-go => ../../../backend-go
