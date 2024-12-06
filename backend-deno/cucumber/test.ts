/*!
  * Cucumber Implementation for Deno
  *
  * Call using: `deno test -A cucumber/test.ts --features [feature folder] --steps [steps folder]`
  *
  * Arguments:
  *  --features [feature folder]  The folder containing the feature files, relative to the current working directory
  *  --steps [steps folder]       The folder containing the step definitions, relative to the current working directory
  *
  * Copyright (2023) WüSpace e. V.
  * Author: Zuri Klaschka
  *
  * MIT License (MIT)
  */

import { parseArgs } from "@std/cli";
import { getStep, importStepDefinitions } from "./step-registry.ts";
import { resolve } from "@std/path";
import { AssertionError } from "@std/assert";

/// Determine steps and features folder from command line arguments

const { steps, features } = parseArgs(Deno.args);
const stepsFolderPath = resolve(Deno.cwd(), steps);
const featuresFolderPath = resolve(Deno.cwd(), features);

/// Import all features

const featureDefinitions = [];

for await (const potentialFeature of Deno.readDir(featuresFolderPath)) {
  const isFeatureFile = potentialFeature.isFile &&
    potentialFeature.name.endsWith(".feature");
  if (isFeatureFile) {
    const filePath = resolve(featuresFolderPath, potentialFeature.name);
    featureDefinitions.push(
      Deno.readTextFileSync(
        filePath,
      ),
    );
  }
}

/// Import all step definitions

await importStepDefinitions(stepsFolderPath);

/// Run all features

for (const featureFile of featureDefinitions) {
  const feature = parseFeature(featureFile);

  Deno.test(`Feature: ${feature.name}`, async (t) => {
    for (const scenario of feature.scenarios) {
      await t.step(`Scenario: ${scenario.name}`, async (t) => {
        await runScenario(scenario, t);
      });
    }
  });
}

/**
 * Run a scenario in a deno testing context
 * @param scenario the scenario to run
 * @param t the text context. Required to keep async steps in order
 */
async function runScenario(scenario: Scenario, t: Deno.TestContext) {
  /**
   * The context object passed to all steps
   * 
   * This is used to share data between steps
   */
  const ctx = {};
  for (const step of scenario.steps) {
    const stepAction = getStep(step.name);
    if (!stepAction) {
      throw new AssertionError(`Step not found: ${step.name}`);
    }

    await t.step(`${step.type} ${step.name}`, async () => {
      await stepAction(ctx);
    });
  }
}

/**
 * A Gherkin feature
 */
interface Feature {
  /**
   * The name of the feature
   */
  name: string;
  /**
   * The scenarios in the feature
   */
  scenarios: Scenario[];
}

/**
 * A Gherkin scenario
 */
interface Scenario {
  /**
   * The name of the scenario
   */
  name: string;
  /**
   * The steps in the scenario
   */
  steps: Step[];
}

/**
 * A Gherkin step
 */
interface Step {
  /**
   * The type of the step
   */
  type: 'Given' | 'When' | 'Then';
  /**
   * The name of the step
   */
  name: string;
}

/**
 * Parse a Ghrekin feature
 * @param featureCode The Ghrekin feature code
 * @returns The parsed feature
 */
function parseFeature(featureCode: string): Feature {
  const lines = extractLines();

  let featureName = "";
  const scenarios: Scenario[] = [];

  for (const line of lines) {
    if (line.startsWith("Feature:")) {
      featureName = line.replace("Feature:", "").trim();
      continue;
    }

    if (line.startsWith("Scenario:")) {
      scenarios.push({
        name: line.replace("Scenario:", "").trim(),
        steps: [],
      });
      continue;
    }

    const scenario = scenarios.at(-1);
    if (!scenario) {
      continue;
    }

    for (const keyword of ["Given", "When", "Then"] satisfies Step['type'][]) {
      if (line.startsWith(keyword + " ")) {
        scenario.steps.push({
          type: keyword,
          name: line.replace(keyword, "").trim(),
        });
        continue;
      }
    }

    for (const keyword of ["And", "But", "*"]) {
      if (line.startsWith(keyword + " ")) {
        if (scenario.steps.length === 0) {
          throw new Error(
            `Step "${keyword}" is not allowed in the first step of a scenario.`,
          );
        }
        scenario.steps.push({
          type: scenario.steps[scenario.steps.length - 1].type,
          name: line.replace("And", "").trim(),
        });
        continue;
      }
    }
  }

  return {
    name: featureName,
    scenarios,
  };

  function extractLines() {
    featureCode = featureCode.replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n") // Normalize line endings
      .replace(/ {2,}/g, " ") // Normalize whitespace
      .replace(/\n{2,}/g, "\n") // Normalize multiple line endings
      .replace(/\t/g, "  ") // Normalize tabs
      .replace(/* indented */ /^ {2,}/gm, ""); // Remove indentation

    const lines = featureCode.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return lines;
  }
}
