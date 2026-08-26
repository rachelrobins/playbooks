import { z } from 'zod';
import { isPasswordStrongEnough } from './passwordStrength';

export const registerSchema = z
  .object({
    email: z.string().email('A valid email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  })
  .refine((data) => isPasswordStrongEnough(data.password, [data.email]), {
    message: 'Password is too weak or guessable. Try adding more unique words or characters.',
    path: ['password'],
  });

export const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
