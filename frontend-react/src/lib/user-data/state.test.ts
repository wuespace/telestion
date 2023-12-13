import { beforeEach, describe, expect, test, vi } from 'vitest';
import { z } from 'zod';

import { setUser } from '../auth';
import { getUserData, setUserData } from './state.ts';
import { userDataSchema } from './model.ts';

describe('userData', () => {
	beforeEach(() => {
		localStorage.clear();
		setUser({
			username: 'test',
			natsUrl: 'nats://localhost:4222'
		});
	});

	test('getUserData returns undefined if no user is logged in', () => {
		setUser(null);
		expect(getUserData()).toEqual(undefined);
	});

	test('getUserData returns undefined if no user data is stored', () => {
		localStorage.removeItem('userdata-test-nats://localhost:4222');
		expect(getUserData()).toEqual(undefined);
	});

	test('getUserData returns undefined if stored user data is invalid', () => {
		localStorage.setItem('userdata-test-nats://localhost:4222', 'invalid');
		expect(getUserData()).toEqual(undefined);
	});

	test('getUserData returns stored user data if it is valid', () => {
		const testUserData = {
			version: '1.0.0',
			dashboards: {},
			widgetInstances: {}
		} as z.infer<typeof userDataSchema>;
		localStorage.setItem(
			'userdata-test-nats://localhost:4222',
			JSON.stringify(testUserData)
		);
		expect(getUserData()).toEqual(testUserData);
	});

	test('setUserData writes to the console if no user is logged in', () => {
		setUser(null);

		// vitest spy
		const spy = vi.spyOn(console, 'error');

		setUserData({
			version: '1.0.0',
			dashboards: {},
			widgetInstances: {}
		});

		expect(spy).toHaveBeenCalledWith(
			'Cannot set user data without logged in user.'
		);
	});

	test('setUserData writes to the console if invalid data is passed', () => {
		const spy = vi.spyOn(console, 'error');

		setUserData({
			version: '1.jfowejf0.0',
			dashboards: {},
			widgetInstances: {}
		} as z.infer<typeof userDataSchema>);

		expect(spy).toHaveBeenCalledWith(
			'Invalid user data passed to set - does not match schema.'
		);
	});

	test('setUserData writes to localStorage if valid data is passed', () => {
		const testUserData = {
			version: '1.0.0',
			dashboards: {},
			widgetInstances: {}
		} as z.infer<typeof userDataSchema>;
		setUserData(testUserData);

		expect(localStorage.getItem('userdata-test-nats://localhost:4222')).toEqual(
			JSON.stringify(testUserData)
		);
	});
});
