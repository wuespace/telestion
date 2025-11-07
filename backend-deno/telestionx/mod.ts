import { NatsConnection } from "@nats-io/nats-core";
import { type ZodType, z } from "@zod/zod/v4";

export class TelestionService {
	public readonly handlers: TelestionServiceHandler[] = [];

	constructor(public readonly name: string, public readonly description: string, ...handlers: TelestionServiceHandler[]) {
		this.registerHandler(...handlers);
	}

	public registerHandler(...handlers: TelestionServiceHandler[]): void {
		if (handlers.length === 0) {
			return;
		}

		for (const handler of handlers) {
			if (this.handlers.includes(handler)) {
				console.warn(`Handler ${handler} already registered in service "${this.name}", skipping duplicate.`);
				continue;
			}
			this.handlers.push(handler);
		}
	}


	public serve(nc: NatsConnection): void {
		// Service logic to interact with NATS connection goes here
		for (const handler of this.handlers) {
			handler.handle(nc);
		}
	}
}

interface TelestionServiceHandler {
	handle(nc: NatsConnection): void;
	readonly inputSubjects: string[];
	readonly inputSchema: ZodType;
	readonly replySchema?: ZodType;
	readonly outputs: TelestionServiceHandlerOutput[];
}

interface TelestionServiceHandlerOutput {
	subjects: string[];
	schema: ZodType;
}

export class SubscribeHandler implements TelestionServiceHandler {
	public inputSubjects: string[] = [];
	public inputSchema: ZodType = z.any()
	public replySchema?: ZodType
	public outputs: TelestionServiceHandlerOutput[] = [];

	private handlerFunction: (data: any, msg: any, publish: (subject: string, data: any) => void) => void = () => { }

	public input(subjects: string[], schema: ZodType): this {
		this.inputSubjects = subjects;
		this.inputSchema = schema;
		return this;
	}

	public output(subjects: string[], schema: ZodType): this {
		this.outputs.push({ subjects, schema });
		return this;
	}

	public handle(nc: NatsConnection): void {
		for (const subject of this.inputSubjects) {
			nc.subscribe(subject, {
				callback: (err, msg) => {
					if (err) {
						console.error("Error receiving message:", err);
						return;
					}
					let data;
					try {
						data = this.inputSchema.parse(JSON.parse(msg.data));
					} catch (e) {
						console.error("Invalid message format:", e);
						return;
					}
					const publish = (subject: string, data: any) => {
						nc.publish(subject, JSON.stringify(data));
					};
					this.handlerFunction(data, msg, publish);
				}
			});
		}
	}
}

const exampleService = new TelestionService(
	"ExampleService",
	"This is an example Telestion service."
);

exampleService.registerHandler(
	new SubscribeHandler()
		.input(["example.subject"], z.object({ message: z.string() }))
		.output(["example.reply"], z.object({ success: z.boolean() }))
		.output(["example.log"], z.object({ log: z.string() }))
		.handle((data, msg, publish) => {
			console.log("Received data:", data.message);
			publish("example.reply", { success: true });
			publish("example.log", { log: "Processed message: " + data.message });
		})
);