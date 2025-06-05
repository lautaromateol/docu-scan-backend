import { z } from "zod";

export const CreateMemberObject = z.object({
  userId: z.string().uuid(),
  workspaceId: z.string().uuid(),
  role: z.enum(["MEMBER", "ADMIN"])
})

export type CreateMember = z.infer<typeof CreateMemberObject>