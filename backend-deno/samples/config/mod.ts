import {startService} from "jsr:@wuespace/telestion";
import {z} from "npm:zod";

// Start the service
const {config, serviceName, dataDir} = await startService({
    nats: false // we don't need NATS to work with the config
});

// Standard config options
console.log(`Service "${serviceName}" started!`);
console.log(`Data directory: ${dataDir}`);

// Custom config options
const customConfig = z.object({
    MY_STRING: z.string(),
}).parse(config);

console.log(`My string: ${customConfig.MY_STRING}`);

// Everything
console.log("Complete config: ", config);

// The end
console.log("Stopping service...")
