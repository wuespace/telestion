<div align="center"><img width="256" height="256" src="./branding/telestion-logo.png" alt="The logo of Telestion"></div>

# Telestion

[![DOI: 10.5281/zenodo.10407142](https://zenodo.org/badge/DOI/10.5281/zenodo.10407142.svg)](https://doi.org/10.5281/zenodo.10407142)

**The best framework for mission control and ground station software.**

Telestion is a modern, polyglot, microservice-based framework that provides everything you need to build sophisticated ground station and mission control applications.

## Key Features

🌐 **Polyglot**: Write services in TypeScript/Deno, Go, or any language with NATS support  
🔧 **Microservice Architecture**: Independent, scalable services communicating via NATS message bus  
📊 **End-to-End Solution**: From data acquisition to visualization  
🚀 **Production Ready**: Battle-tested in real aerospace projects  
💻 **Modern Stack**: Vite, React, Deno, Go - best-in-class developer experience  

## Quick Start

Check out our [end-to-end demo](examples/end-to-end-demo/README.md) to see Telestion in action with multiple services working together.

## Architecture

Telestion follows a microservice architecture where services communicate via a NATS message bus. Services can be written in different languages and deployed independently. See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

## Components

- **[backend-deno/](backend-deno/)** - Service framework for TypeScript/Deno
- **[backend-go/](backend-go/)** - Service framework for Go
- **[frontend-react/](frontend-react/)** - React-based frontend library
- **[docs/](docs/)** - Comprehensive documentation
- **[examples/](examples/)** - Working examples and demos

## Documentation

📚 [Full Documentation](https://docs.telestion.wuespace.de/)

## License

This project is licensed under the terms of the [MIT license](LICENSE).
