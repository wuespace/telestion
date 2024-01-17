/**
 * Waits for the specified amount of time before resolving the returned promise.
 *
 * @param timeout - The duration in milliseconds to wait before resolving.
 * @returns A promise that resolves after the specified time has elapsed.
 * @internal
 */
export function wait(timeout: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, timeout));
}
