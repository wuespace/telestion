# Project folder structure

Every Telestion project is different, and so is its folder structure. Some projects might not even have a frontend and write every backend service in Java, while others might have a frontend and use Deno for their backend services.

That's not very helpful, is it? So, let's take a look at a folder structure that is suitable for most projects. Note that as your project grows, you might want to change the structure to better suit your needs. But you will know when the time has come.

## Version control

The first thing you should do is to create a new Git repository. This repository will contain all the code for your project. You can use GitHub, GitLab, or any other Git hosting service you like.

## Recommended folder structure

The following folder structure is recommended for most projects:

- :material-folder: `backend-deno` - A folder that contains all backend services written in Deno.
	- :material-folder: `[service-name]` - A folder that contains a backend service written in Deno.
		- :material-file: `mod.ts` - The entry point of the backend service.
		- :material-file: `README.md` - A file that contains information about the backend service.
	- :material-file: `Dockerfile` - A Dockerfile for the Deno-based backend services, if you want to use Docker.
- :material-folder: `frontend-react` - A folder that contains the frontend written in React.
    - :material-file: `package.json` - The frontend application's `package.json` file.
    - ...
- :material-folder: `frontend-cli` - A folder that contains the CLI frontend written in Deno.
    - :material-file: `mod.ts` - The entry point of the CLI.
    - :material-file: `README.md` - A file that contains information about the CLI.
- :material-folder: `nats` - A folder that contains the NATS server configuration.
    - :material-file: `nats-server.conf` - The configuration file for the NATS server.
- :material-file: `docker-compose.yml` - A Docker Compose file that contains the configuration for the Docker containers.
- :material-file: `README.md` - A file that contains information about the project.

## Alternatives

There are also other options how you could structure your project. For example, if you have completely distinct groups of services that are not related to each other, you could create a folder for each group, and differentiate between programming languages used under these groups.

However, to get started, the above structure should be sufficient. You can always change it later.

*[backend service]: A service that acts on behalf of themself and does not require user interaction.
*[frontend]: A service that acts on behalf of the user and allows them to interact with the backend services.
*[CLI]: Command Line Interface
*[Deno]: A runtime for JavaScript and TypeScript
