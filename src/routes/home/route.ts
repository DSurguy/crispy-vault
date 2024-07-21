import { z } from 'zod';
export const homeSearchSchema = z.object({
  uuid: z.string().catch(''),
})