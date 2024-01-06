FROM golang:1.21-alpine

# creates an "invisible" docker volume during container startup
# by retaining the go builc cache from the image build
# to support different cpu architectures
VOLUME /go

# switch to app
WORKDIR /app
