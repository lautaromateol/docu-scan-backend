import { z } from "zod";

export const CreateMemberObject = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().uuid()
})

export type CreateMember = z.infer<typeof CreateMemberObject>