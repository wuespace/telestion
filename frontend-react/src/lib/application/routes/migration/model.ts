import { z } from 'zod';

export const promptActionSchema = z.union([
	z.literal('default'),
	z.literal('import'),
	z.literal('blank'),
	z.literal('existing')
]);

/**
 * Describes all possible actions a button group
 * in a migration prompt can trigger.
 */
export type PromptAction = z.infer<typeof promptActionSchema>;
