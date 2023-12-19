import { startService } from "../../mod.ts";
import { Then, When } from "../step-registry.ts";
import { assert, assertRejects } from "./deps.ts";

When("I start the service", async (ctx) => {
  if (!ctx.nats) {
    throw new Error("No NATS mock available");
  }

  ctx.service = await startService({
    natsMock: ctx.nats
  });
});

When("I start the service with {string}", async (ctx, arg) => {
  if (!ctx.nats) {
    throw new Error("No NATS mock available");
  }

  ctx.service = await startService({
    natsMock: ctx.nats,
    overwriteArgs: arg.split(/\s+/),
  });
});

When("I start the service without NATS", async (ctx) => {
  ctx.service = await startService({
    nats: false,
  });
});

When('I start the service with {string} without NATS', async (ctx, arg) => {
  // Write code here that turns the phrase above into concrete actions
  ctx.service = await startService({
    nats: false,
    overwriteArgs: arg.split(/\s+/),
  });
})

Then("the service should fail to start", async (ctx) => {
  await assertRejects(() =>
    startService({
      nats: !!ctx.nats,
      natsMock: ctx.nats,
    })
  );
});

Then("the service should start", (ctx) => {
  assert(ctx.service);
});
