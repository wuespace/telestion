---
tags: [ Deployment ]
---

# Deployment

Deployment is the process of making a software system available for use. In the context of Telestion, deployment refers to the process of making the Telestion application available for use.

!!! warning
	The deployment process is heavily dependent on the specific use case. The following documentation is intended to give a general overview of the deployment process that's available by default in new Telestion Projects.

	Depending on your project, you may need to adapt the deployment process to your specific needs.

## Deployment Methods

Telestion can be deployed in multiple ways:

* [Local Deployment](local/index.md)
* [Docker Deployment](docker/index.md)
* [Kubernetes Deployment](kubernetes/index.md)

!!! info
	The local deployment is the easiest way to get started with Telestion. You should probably start with the local deployment and then move on to the other deployment methods as needed.

## NATS and its configuration

Telestion uses [NATS](https://nats.io/) as its message broker. NATS is a lightweight, high-performance cloud-native messaging system. It is used for the communication between the Telestion backend and the Telestion frontend.

No matter which deployment method you choose, you need to configure NATS. The configuration of NATS is described in the [NATS Configuration](nats/index.md) document.
