import { resolve } from "./deps.ts";

/**
 * A step definition
 * 
 * @see https://cucumber.io/docs/cucumber/step-definitions/?lang=javascript
 */
interface StepDefinition {
  /**
   * The name of the step definition that gets matched against the step name
   */
  name: string;
  /**
   * Check if the step matches the step definition
   * @param step The step name
   * @returns `false` if the step does not match, otherwise an array of parameters
   */
  matches: (step: string) => string[] | false;
  /**
   * The action to perform when the step is executed
   * @param ctx A context object that can be used to share state between steps
   * @param params Parameters extracted from the step name
   * @returns potentially a promise that resolves when the step is done
   */
  action: (
    ctx: Record<string, unknown>,
    ...params: string[]
  ) => void | Promise<void>;
}

/**
 * A registry of parameters that can be used in step definition names
 */
const paramRegistry: Record<string, {
  regex: RegExp;
}> = {
  "{string}": {
    regex: /^"([^"]+)"$/,
  },
};

/**
 * A registry of step definitions
 */
const stepRegistry: StepDefinition[] = [];

/**
 * Register a step definition to be used in scenarios
 * @param name the name of the step definition
 * @param action the action to perform when the step is executed
 */
function registerStep(name: string, action: StepDefinition["action"]) {
  stepRegistry.push({
    name,
    action,
    matches: (step: string) => {
      let regex = "^" + escapeRegExp(name) + "$";
      for (const param in paramRegistry) {
        let paramRegex = paramRegistry[param].regex.source;
        if (paramRegex.startsWith("^")) {
          paramRegex = paramRegex.slice(1);
        }
        if (paramRegex.endsWith("$")) {
          paramRegex = paramRegex.slice(0, -1);
        }
        regex = regex.replaceAll(escapeRegExp(param), paramRegex);
      }

      const match = step.match(new RegExp(regex));

      if (match) {
        return match.slice(1);
      }

      return false;
    },
  });
}

/**
 * Escape special characters in a string to be used in a regular expression
 * @param string input
 * @returns `input` with all special characters escaped
 * 
 * @see https://stackoverflow.com/a/6969486/9276604 by user coolaj86 (CC BY-SA 4.0)
 */
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

/**
 * Import all step definitions from a folder
 * @param stepsFolderPath the path to the folder containing the step definitions
 */
export async function importStepDefinitions(stepsFolderPath: string) {
  const files = Deno.readDirSync(stepsFolderPath);

  for (const file of files) {
    const filePath = resolve(stepsFolderPath, file.name);

    if (file.isDirectory || !file.name.endsWith(".ts")) {
      continue;
    }

    console.debug(`Importing step file: ${filePath}`);
    await import(filePath);
  }

  console.debug("Steps imported");
}

/**
 * Retrieve the action to perform when a step is executed
 * @param name the name of the step
 * @returns the `StepDefinition.action` function if a step definition matches the step name, otherwise `undefined`
 */
export function getStep(name: string): StepDefinition["action"] | undefined {
  const step = stepRegistry.find((step) => step.matches(name));
  return step
    ? (ctx) => step.action(ctx, ...step.matches(name) as string[])
    : undefined;
}

/**
 * Register a step definition to be used in scenarios
 * @param name the name of the step definition. Can contain parameters.
 * @param action the action to perform when the step is executed
 */
export function Given(name: string, action: StepDefinition["action"]) {
  registerStep(name, action);
}

/**
 * Register a step definition to be used in scenarios
 * @param name the name of the step definition. Can contain parameters.
 * @param action the action to perform when the step is executed
 */
export function When(name: string, action: StepDefinition["action"]) {
  registerStep(name, action);
}

/**
 * Register a step definition to be used in scenarios
 * @param name the name of the step definition. Can contain parameters.
 * @param action the action to perform when the step is executed
 */
export function Then(name: string, action: StepDefinition["action"]) {
  registerStep(name, action);
}
