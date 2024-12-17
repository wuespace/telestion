# Use the official Golang image as the base image
FROM golang:1.23-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application code
COPY . .

# Build the Go application
RUN go build -o /testbed ./testbed/testbed.go

# Set the entrypoint to the built binary
ENTRYPOINT ["/testbed"]

# Default command (can be overridden by CMD in docker run)
CMD []
