import { z } from 'zod';

// Source: zod's `README.md`, crediting https://github.com/ggoodman

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
export const jsonSchema: z.ZodType<Json> = z.lazy(() => {
	return z.union([
		literalSchema,
		z.array(jsonSchema),
		z.record(z.string(), jsonSchema)
	]);
});
