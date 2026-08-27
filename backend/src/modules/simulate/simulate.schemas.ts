/**
 * Defines the schema for validating trigger simulation requests
 * and derives the corresponding TypeScript input type.
 */
import { z } from 'zod';
import { TRIGGERS } from '../../common/domain';

export const simulateTriggerSchema = z.object({
  trigger: z.enum(TRIGGERS, {
    errorMap: () => ({ message: `Trigger must be one of: ${TRIGGERS.join(', ')}` }),
  }),
});

export type SimulateTriggerInput = z.infer<typeof simulateTriggerSchema>;
