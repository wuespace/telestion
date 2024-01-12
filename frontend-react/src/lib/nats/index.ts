/**
 * @packageDocumentation
 *
 * Re-exporting the most used types and functions from the `nats.ws` package.
 *
 * @example
 * ```tsx
 * import { Msg, JSONCodec, ... } from '@wuespace/telestion/nats';
 * ```
 *
 * @see https://docs.nats.io/using-nats/developer
 * @see https://github.com/nats-io/nats.ws#readme
 */
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
