# Cucumber Testing Implementation

Since we are using Deno, there is no official Cucumber implementation for Deno.
However, it's pretty easy to parse the Gherkin files and execute the steps.
This folder contains a custom implementation of Cucumber for Deno.

## How to run the tests

Run the following command to run the tests:

```bash
docker-compose up
```

In the background, this uses `deno test` with the [`test.ts`](test.ts) file as entrypoint.

## Feature file location

Since the feature files specify the general behavior of services, they are independent of the implementation (here:
Deno).
Therefore, the feature files are located in the repo's [`/backend-features`](../../backend-features) folder.

## Setting up VSCode

1. Open both folders (`/backend-deno` and `/backend-features`) in VSCode in the same workspace.
2. Install recommended extensions.
3. Open the workspace settings and add the following:

```json
{
  "cucumberautocomplete.steps": ["backend-deno/**/*.ts"],
  "cucumberautocomplete.syncfeatures": "backend-features/**/*.feature"
}
```

Now, you should have autocompletion for the step definitions and the feature files.

## Unsupported Gherkin features

As of right now, the following Gherkin features are not supported:

- Doc Strings
- Data Tables
- Backgrounds
- Tags
- Scenario Outlines
- Examples
