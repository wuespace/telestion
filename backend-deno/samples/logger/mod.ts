import { startService } from "https://deno.land/x/telestion/mod.ts";
import { encode } from "https://deno.land/std@0.186.0/encoding/hex.ts";
import { resolve } from "https://deno.land/std@0.186.0/path/mod.ts";

const encoder = new TextEncoder();

const { messageBus, dataDir } = await startService();

const logFilePath = resolve(dataDir, "log.txt");
await Deno.mkdir(dataDir, { recursive: true });

const logMessages = messageBus.subscribe("log.>");

console.log("Logger started");

for await (const msg of logMessages) {
  try {
    const currentTime = new Date().toISOString();
    const logMessage = encode(msg.data).toString();
    const subject = msg.subject.split(".")[1];

    console.log(`${currentTime} [${subject}] ${logMessage}`);
    await Deno.writeFile(
      logFilePath,
      encoder.encode(`${currentTime} [${subject}] ${logMessage}\n`),
      { append: true },
    );
  } catch (error) {
    console.error(error);
  }
}
