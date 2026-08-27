/**
 * Defines the validation schema for creating playbooks and derives the
 * corresponding TypeScript input type from the schema.
 */
import { z } from 'zod';
import { ACTIONS, MAX_ACTIONS, MIN_ACTIONS, TRIGGERS } from '../../common/domain';

// Validates and constrains the input used to create a playbook.
export const createPlaybookSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  trigger: z.enum(TRIGGERS, {
    errorMap: () => ({ message: `Trigger must be one of: ${TRIGGERS.join(', ')}` }),
  }),
  actions: z
    .array(
      z.enum(ACTIONS, {
        errorMap: () => ({ message: `Actions must be one of: ${ACTIONS.join(', ')}` }),
      }),
    )
    .min(MIN_ACTIONS, `At least ${MIN_ACTIONS} action is required`)
    .max(MAX_ACTIONS, `At most ${MAX_ACTIONS} actions are allowed`)
    .refine((actions) => new Set(actions).size === actions.length, {
      message: 'Actions must be unique',
    }),
});

// Derives the TypeScript input type directly from the Zod schema.
export type CreatePlaybookInput = z.infer<typeof createPlaybookSchema>;
