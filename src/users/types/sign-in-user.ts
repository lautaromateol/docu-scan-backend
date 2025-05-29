import { z } from 'zod';

export const SignInUserObject = z.object({
  email: z
    .string()
    .min(5, {
      message: 'Please insert at least 5 characters',
    })
    .max(50, {
      message: 'The maximum length allowed it is 50 characters.',
    })
    .email(),
  password: z
    .string()
    .min(8, {
      message: 'Please insert between 8-20 characters',
    })
    .max(20, {
      message: 'Please insert between 8-20 characters',
    })
});

export type SignInUser = z.infer<typeof SignInUserObject>;
