import { AssertionError, resolve } from "./deps.ts";
import { getStep, importSteps } from "./step-registry.ts";

const featuresFolderPath = "/features"; // resolve(dirname(import.meta.url), "features");
const featureFiles = [];

for await (const dirEntry of Deno.readDir(featuresFolderPath)) {
  console.debug(`Found file: ${dirEntry.name}`);
  if (dirEntry.isFile && dirEntry.name.endsWith(".feature")) {
    const filePath = resolve(featuresFolderPath, dirEntry.name);
    featureFiles.push(
      Deno.readTextFileSync(
        filePath,
      ),
    );
  }
}

await importSteps();

for (const featureFile of featureFiles) {
  const feature = parseFeature(featureFile);

  Deno.test(`Feature: ${feature.name}`, async (t) => {
    for (const scenario of feature.scenarios) {
      await t.step(`Scenario: ${scenario.name}`, async (t) => {
        await runScenario(scenario, t);
      });
    }
  });
}

async function runScenario(scenario: Scenario, t: Deno.TestContext) {
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

interface Feature {
  name: string;
  scenarios: Scenario[];
}

interface Scenario {
  name: string;
  steps: Step[];
}

interface Step {
  type: string;
  name: string;
}

function parseFeature(featureFile: string): Feature {
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

    for (const keyword of ["Given", "When", "Then"]) {
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
    featureFile = featureFile.replace(/\r\n/g, "\n") // Normalize line endings
      .replace(/\r/g, "\n") // Normalize line endings
      .replace(/ {2,}/g, " ") // Normalize whitespace
      .replace(/\n{2,}/g, "\n") // Normalize multiple line endings
      .replace(/\t/g, "  ") // Normalize tabs
      .replace(/* indented */ /^ {2,}/gm, ""); // Remove indentation

    const lines = featureFile.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    return lines;
  }
}
