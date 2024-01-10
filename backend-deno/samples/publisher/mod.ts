import { JSONCodec, startService } from "https://deno.land/x/telestion/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const { messageBus, config } = await startService();

const { DATA_SUBJECT, FREQUENCY } = z.object({
  DATA_SUBJECT: z.string(),
  FREQUENCY: z.coerce.number().positive().default(3000),
}).parse(config);

console.log("Publisher started with config", {
  DATA_SUBJECT,
});

setInterval(() => {
  const value = {
    value: Math.random(),
    time: new Date().toISOString(),
  };
  console.log("Publishing", value, "to", DATA_SUBJECT);
  messageBus.publish(
    DATA_SUBJECT,
    JSONCodec().encode(value),
  );
  console.log("Published", value, "to", DATA_SUBJECT);
}, FREQUENCY);
