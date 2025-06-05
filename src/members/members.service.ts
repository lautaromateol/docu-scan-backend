import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMember, CreateMemberObject } from "./types/create-member";

@Injectable()
export class MembersService {
  constructor(private prismaService: PrismaService) {}

  async getMember(userId: string) {
    const member = await this.prismaService.member.findFirst({
      where: { userId }
    })

    return member
  }

  async createMember(member: CreateMember) {
    const validation = CreateMemberObject.safeParse(member)

    if(!validation.success) {
      throw new BadRequestException({
        errors: validation.error.issues,
        statusCode: 400,
      })
    }

    const dbMember = await this.prismaService.member.create({
      data: {
        userId: member.userId,
        workspaceId: member.workspaceId,
        role: member.role
      }
    })

    return dbMember
  }
}