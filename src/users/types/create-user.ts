import { z } from 'zod';

export const CreateUserObject = z
  .object({
    name: z
      .string()
      .min(5, {
        message: 'Please insert at least 5 characters',
      })
      .max(50, {
        message: 'The maximum length allowed it is 50 characters.',
      }),
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
      }),
    confirmPassword: z
      .string()
      .min(8, {
        message: 'Please insert between 8-20 characters',
      })
      .max(20, {
        message: 'Please insert between 8-20 characters',
      }),
    pictureUrl: z
      .string()
      .url()
      .startsWith('https://res.cloudinary.com/')
      .nullish(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type CreateUser = z.infer<typeof CreateUserObject>;
