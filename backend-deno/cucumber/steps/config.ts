import { startService } from "../../mod.ts";
import { Given, Then } from "../step-registry.ts";
import { assertEquals } from "./deps.ts";

Given('I have an environment variable named {string} with value {string}', (_ctx, key, value) => {
  Deno.env.set(key, value);
});

Given('I have the basic service configuration', () => {
	Object.keys(Deno.env.toObject()).forEach((key) => {
		Deno.env.delete(key);
	});
	Deno.env.set('NATS_URL', 'localhost:4222');
	Deno.env.set('DATA_DIR', '/tmp/deno-gherkin');
	Deno.env.set('SERVICE_NAME', 'deno-gherkin');
});

Then('the service should be configured with {string} set to {string}', (ctx, key, shouldBe) => {
	const theService = ctx.service as Awaited<ReturnType<typeof startService>>;

	const value = theService.config[key];

	assertEquals((value ?? 'undefined').toString(), shouldBe);
});

Given('I have no service configuration', () => {
	Object.keys(Deno.env.toObject()).forEach((key) => {
		Deno.env.delete(key);
	});
})
