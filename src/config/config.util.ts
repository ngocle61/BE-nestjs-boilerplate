import { z } from 'zod';

export const parseEnv = <TSchema extends z.ZodType>(schema: TSchema): z.output<TSchema> => {
  const result = schema.safeParse(process.env);
  if (!result.success) throw new Error(z.prettifyError(result.error));
  return result.data;
};
