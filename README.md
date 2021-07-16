<p><img src="./branding/telestion-logo.png" alt="The logo of Telestion"></p>

# Telestion

Telestion is a modular groundstation software for various projects.
This repository highlights the various project repositories and serves as an entry point.
It gives a fast overview and helps for a fast start into the project.

## Telestion Structure

The project is structured in two main repositories and project specific repositories.

### [Telestion Core](https://github.com/wuespace/telestion-core)

The core repository contains libraries and services which build the backbone of the groundstation.

### [Telestion Client](https://github.com/wuespace/telestion-client)

The client repositories contains libraries for building project specific user interfaces.

## Specialised User Project Structure

For every project a specialised version is build out of the libraries.
The following template serves as the starting point for a new Telestion project.

### [Telestion Project Template](https://github.com/wuespace/telestion-project-template)

The template contains three components in the coresponding subfolders.

#### Definitions

Definitions contains project general definitions and configurations like message types.

#### Application

In the application folder the backbone is extended and the used services are defined and configured.

#### Client

The client folder contains the configuration of the user interface and project specific gui elements.

### [Telestion Extension Template](https://github.com/wuespace/telestion-extension-template)

The template contains the base structure for an extension.

## Telestion Projects

Notable Telestion projects are Telestion Central, RocketSound and Daedalus2.

### Telestion Central

For the WüSpace we provide a central infrastructure to synchronise the data between our projects.
It is an own Telestion project with specialised services.

### [Telestion RocketSound](https://github.com/wuespace/telestion-project-rocketsound)

Telestion RocketSound provides a groundstation for a student experiment about estimating the state of a rocket based on sound measurements.

### [Telestion Daedalus2](https://github.com/wuespace/telestion-project-daedalus2)

Telestion Daedalus2 provides a groundstation for a REXUS experiment which tests a recovery mechanism on a sounding rocket.

## Extensions

Extensions are too specialized for the Telestiob Core and therefore need an extra space for their implementation.

### [MavLink Extension](https://github.com/wuespace/telestion-extension-mavlink)

This extension provides libraries that can interpret and create MavLink messages.

## Additional Documentation

Our documentation can be found in the [telestion-docs](https://github.com/wuespace/telestion-docs) repository.
Also the [website](https://telestion.wuespace.de) provides some information about the project.
