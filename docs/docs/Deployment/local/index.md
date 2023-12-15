---
tags: [Deployment, Local]
---
# Local Deployment

Telestion can be deployed locally on your machine. This can have several reasons, for example:

* You want to test your application before deploying it to a server
* You want to develop an application and test it locally
* You want to run Telestion on a machine without internet connection
* You want to run Telestion on a machine without Docker/Kubernetes
* You need to access the machine directly (for example, for CAN bus access)

!!! note
	It's a common tactic to have most Telestion services running in a cloud environment and only the services that need direct access to the machine running locally.

	This is easy to achieve thanks to NATS and means that you can have the best of both worlds.
