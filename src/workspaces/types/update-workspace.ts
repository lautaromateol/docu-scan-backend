import { z } from 'zod';

export const UpdateWorkspaceObject = z.object({
  name: z
    .string()
    .min(5, {
      message: 'Please insert at least 5 characters',
    })
    .max(50, {
      message: 'The maximum length allowed it is 50 characters.',
    })
    .optional()
});

export type UpdateWorkspace = z.infer<typeof UpdateWorkspaceObject>