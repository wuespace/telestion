---
tags: [ Deployment ]
---

# Concepts

This document describes the pre-requisites for deploying Telestion on your local machine.

## Docker

Docker is a containerization platform that allows you to package your application and all its dependencies together in the form of containers to ensure that your application works seamlessly in any environment be it development or test or production.

## Docker Compose

Docker Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application's services. Then, with a single command, you create and start all the services from your configuration.

## Kubernetes

!!! info 
	Kubernetes is not required for deploying Telestion. It's mostly relevant for big production deployments.

Kubernetes is an open source container-orchestration system for automating computer application deployment, scaling, and management.

## Web Server

!!! info
	For Telestion, a web server is required to serve the frontend application to the user.

A web server is server software, or hardware dedicated to running said software, that can satisfy web client requests. A web server can, in general, contain one or more websites. A web server processes incoming network requests over HTTP and several other related protocols.

## NATS

!!! info
	Telestion uses NATS as a message broker. It's required for the communication between the Telestion services (both backend and frontend).

NATS is a simple, secure and high-performance open source messaging system for cloud native applications, IoT messaging, and microservice architectures.
