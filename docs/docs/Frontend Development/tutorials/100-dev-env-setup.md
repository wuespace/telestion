---
title: Setting up the development environment
# e.g., "Publishing messages to the event bus" or "Installing a dependency using npm"

description: Start a new telestion-client project with the tc-cli
---

In this tutorial, you install the telstion-client-cli and generate a new
telestion-client project.

!!! info "Prerequisites"
	To complete this tutorial, you should be familiar with basic terminal commands.

## What you'll build

The result is a project structure that you can begin to customize.

## Step 1: Installing `tc-cli`

Install the `tc-cli` by running the following command in your terminal:

```sh
npm install --global @wuespace/telestion-client-cli
```

This command installs the CLI, which you can call using the `tc-cli` command.

## Step 2: Initializing the project

This step initializes the project.

Open the terminal where you want to generate the project and run

```sh
tc-cli init myproject
```

Replace `myproject` with your own desired name.

!!! tip "Using the `telestion-project-template`"
When using the
[`telestion-project-template` repository](https://github.com/wuespace/telestion-project-template)
for your project, just run `tc-cli init` (without a folder name) inside the
repository's root folder. This command, then, automatically bootstraps a Client
project into the repository's `client` folder.


This command generates a folder with the chosen name that contains a
ready-to-use client project and installs all necessary dependencies.

!!! info "Windows execution policies"
On Windows machines, you might get an error message about execution policies. In
this case, run the power shell as administrator and use this command:

    ```
    Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
    ```

    Restart your other terminal and re-run the `tc-cli` command.

## Step 3: Run the client

Run the client by navigating into your folder and run

```sh
npm start
```

!!! tip
This runs `tc-cli start --electron` in the background.

An electron window opens, and you can see your application.

## Next steps

<!-- Short concluding sentence: -->

Now that you've generated your client project, you can configure and extend your
client in the following tutorials.

<!-- Links to next steps/related articles -->

<!--
Snippets
--------

<Reference to="../other-article">
    Relative Link to other article
</Reference>

<Reference to="https://www.example.com">
    Example Website
</Reference>
-->
