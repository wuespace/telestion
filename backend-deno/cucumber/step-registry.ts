import { dirname, fromFileUrl, resolve } from "./deps.ts";

interface Step {
  name: string;
  matches: (step: string) => string[] | false;
  action: (
    ctx: Record<string, unknown>,
    ...params: string[]
  ) => void | Promise<void>;
}

const paramRegistry: Record<string, {
  regex: RegExp;
}> = {
  "{string}": {
    regex: /^"([^"]+)"$/,
  },
};

const stepRegistry: Step[] = [];

function registerStep(name: string, action: Step["action"]) {
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

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export async function importSteps() {
  const stepsDir = resolve(dirname(fromFileUrl(import.meta.url)), "steps");
  const files = Deno.readDirSync(stepsDir);

  for (const file of files) {
    const filePath = resolve(stepsDir, file.name);

    if (file.isDirectory || !file.name.endsWith(".ts")) {
      continue;
    }

    console.debug(`Importing step file: ${filePath}`);
    await import(filePath);
  }

  console.debug("Steps imported");
}

export function getStep(name: string): Step["action"] | undefined {
  const step = stepRegistry.find((step) => step.matches(name));
  return step
    ? (ctx) => step.action(ctx, ...step.matches(name) as string[])
    : undefined;
}

export function Given(name: string, action: Step["action"]) {
  registerStep(name, action);
}

export function When(name: string, action: Step["action"]) {
  registerStep(name, action);
}

export function Then(name: string, action: Step["action"]) {
  registerStep(name, action);
}
