import { describe, expect, test } from 'vitest';
import { setUser, getUser } from './state.ts';
import { User } from './model.ts';

describe('user', () => {
	test('setUser', () => {
		const user: User = {
			username: 'test',
			natsUrl: 'nats://localhost:4222'
		};
		setUser(user);
		expect(getUser()).toEqual(user);
	});

	test('getUser', () => {
		setUser(null);
		expect(getUser()).toEqual(null);
	});
});
