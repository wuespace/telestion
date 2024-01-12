// re-export NATS utils (for convenience)
export { JSONCodec, StringCodec, headers } from 'nats.ws';
export type {
	NatsError,
	NatsConnection,
	Codec,
	Msg,
	MsgHdrs,
	Sub,
	SubOpts,
	Subscription,
	SubscriptionOptions,
	MsgRequest,
	RequestOptions,
	PublishOptions
} from 'nats.ws';
