import { startService } from "jsr:@wuespace/telestion";
import { z } from "npm:zod";

const { messageBus, config, serviceName } = await startService();

const { DATA_SUBJECT, REQUEST_SUBJECT } = z.object({
  DATA_SUBJECT: z.string().endsWith(">"),
  REQUEST_SUBJECT: z.string().endsWith(">"),
}).parse(config);

console.log("Latest value cache started with config", {
  DATA_SUBJECT,
  REQUEST_SUBJECT,
});

const dataStore = new Map<string, Uint8Array>();

console.log("Listening for new data on", DATA_SUBJECT);

// listen to the data subject
const data = messageBus.subscribe(DATA_SUBJECT);
(async () => {
  for await (const msg of data) {
    // data key is the ">" in the subject
    const dataKey = msg.subject.substring(DATA_SUBJECT.length - 1);
    // store the data
    dataStore.set(dataKey, msg.data);

    console.log(
      "Latest value cache received data",
      msg.data,
      "for key",
      dataKey,
    );
  }
})();

// listen to the request subject
const request = messageBus.subscribe(REQUEST_SUBJECT, {
  queue: serviceName,
});
(async () => {
  for await (const msg of request) {
    console.log("Latest value cache received request on", msg.subject);

    // request key is the ">" in the subject
    const requestKey = msg.subject.substring(REQUEST_SUBJECT.length - 1);
    // get the data from the store
    const data = dataStore.get(requestKey);
    // respond with the data or null if there is no data
    msg.respond(data);

    console.log(
      "Latest value cache responded with",
      data,
      "for key",
      requestKey,
    );
  }
})();

await Promise.any([data.closed, request.closed]);
console.log("Latest value cache stopped");
data.drain();
request.drain();
