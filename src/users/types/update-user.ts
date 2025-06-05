import { optional, z } from 'zod';

export const UpdateUserObject = z.object({
  name: z
    .string()
    .min(5, {
      message: 'Please insert at least 5 characters',
    })
    .max(50, {
      message: 'The maximum length allowed it is 50 characters.',
    })
    .optional(),
  email: z
    .string()
    .min(5, {
      message: 'Please insert at least 5 characters',
    })
    .max(50, {
      message: 'The maximum length allowed it is 50 characters.',
    })
    .email()
    .optional(),
  pictureUrl: z
    .string()
    .url()
    .startsWith('https://res.cloudinary.com/')
    .nullish(),
});

export type UpdateUser = z.infer<typeof UpdateUserObject>;
