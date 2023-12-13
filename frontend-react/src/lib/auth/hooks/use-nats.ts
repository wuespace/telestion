import { getNatsConnection } from '../state.ts';

export function useNats() {
	const nc = getNatsConnection();

	if (!nc) {
		throw new Error('No nats connection. Library error: 157fea40');
	}

	return nc;
}
