import { startService } from "https://deno.land/x/telestion/mod.ts";
import { z } from "https://deno.land/x/zod@v3.21.4/mod.ts";

const { messageBus, config } = await startService();

const { FREQUENCY, REQUEST_SUBJECT, OUTPUT_SUBJECT } = z.object({
  FREQUENCY: z.coerce.number().positive().default(5000),
  REQUEST_SUBJECT: z.string(),
  OUTPUT_SUBJECT: z.string(),
}).parse(config);

console.log("Request started with config", {
  FREQUENCY,
  REQUEST_SUBJECT,
  OUTPUT_SUBJECT,
});

setInterval(async () => {
  try {
    const data = await messageBus.request(REQUEST_SUBJECT);
    console.log("Requester received requested data", data.data);
    messageBus.publish(OUTPUT_SUBJECT, data.data);
    console.log("Data forwarded to", OUTPUT_SUBJECT);
  } catch (e) {
    console.warn("Couldn't retrieve data", e);
  }
}, FREQUENCY);
