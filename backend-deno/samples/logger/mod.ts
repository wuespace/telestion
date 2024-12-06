import { startService } from "jsr:@wuespace/telestion";
import { encodeHex } from "jsr:@std/encoding/hex";
import { resolve } from "jsr:@std/path";

const encoder = new TextEncoder();

const { messageBus, dataDir } = await startService();

const logFilePath = resolve(dataDir, "log.txt");
await Deno.mkdir(dataDir, { recursive: true });

const logMessages = messageBus.subscribe("log.>");

console.log("Logger started");

for await (const msg of logMessages) {
  try {
    const currentTime = new Date().toISOString();
    const logMessage = encodeHex(msg.data).toString();
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
