# Docker Deployment

This document describes how to deploy Telestion using Docker.

## Guidelines

These guidelines are not strict rules, but they are recommended to follow. If you have a good reason to deviate from them, feel free to do so. Or in other words: If you don't know why you should deviate from them, don't do it.

### Images per Service Type

Depending on your project, it might make sense to have individual images for each service. However, for smaller projects, this is often both unnecessary and cumbersome. In this case, it is recommended to have one image for all services of a specific type.

For example, you would have one image for all Deno based Backend services, one for the frontend, and so on. This way, you won't have to build and push huge numbers of images, and you can still use the same image for all services of a specific type.

### Dependency Installation at Build Time

If you have a service that requires dependencies to be installed, it is recommended to do so at build time. This way, you can be sure that the dependencies are installed when the image is built, and you don't have to wait for them to be installed when the container is started.

This ensures both a faster startup time and a consistent execution environment.
