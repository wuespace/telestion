import { startService } from "jsr:@wuespace/telestion";
import { z } from "npm:zod";

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
    JSON.stringify(value),
  );
  console.log("Published", value, "to", DATA_SUBJECT);
}, FREQUENCY);
