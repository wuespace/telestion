FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum* ./

# Download dependencies
RUN go mod download

# Copy source code
COPY main.go .

# Build the service
RUN CGO_ENABLED=0 GOOS=linux go build -o data-processor main.go

# Runtime image
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/data-processor .

# Run the service
CMD ["./data-processor"]
