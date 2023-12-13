import { useEffect } from 'react';
import { Msg, SubscriptionOptions } from 'nats.ws';
import { useNats } from './use-nats.ts';

export function useNatsSubscription(
	subject: string,
	callback: (message: Msg) => Promise<void> | void,
	options?: SubscriptionOptions
) {
	const nc = useNats();

	useEffect(() => {
		const subscription = nc.subscribe(subject, options);

		void (async () => {
			for await (const message of subscription) {
				await callback(message);
			}
		})();

		return () => {
			subscription.unsubscribe();
		};
	}, [subject, nc, options, callback]);
}
