import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMember, CreateMemberObject } from "./types/create-member";

@Injectable()
export class MembersService {
  constructor(private prismaService: PrismaService) {}

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
        workspaceId: member.workspaceId
      }
    })

    return dbMember
  }
}