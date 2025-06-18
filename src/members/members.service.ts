import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMember, CreateMemberObject } from './types/create-member';

@Injectable()
export class MembersService {
  constructor(private prismaService: PrismaService) {}

  async updateMemberRole({
    workspaceId,
    userId,
    memberId,
  }: {
    workspaceId: string;
    userId: string;
    memberId: string;
  }) {
    const member = await this.getMember({ workspaceId, userId });

    if (!member || member.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to perform this action.',
      );
    }

    const newMember = await this.prismaService.member.update({
      where: {
        id: memberId,
      },
      data: {
        role: 'ADMIN',
      },
    });

    return {
      statusCode: 200,
      member: newMember,
    };
  }

  async getMembers({ workspaceId }: { workspaceId: string }) {
    const members = await this.prismaService.member.findMany({
      where: {
        workspaceId,
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            pictureUrl: true,
          },
        },
      },
    });

    return {
      statusCode: 200,
      members,
    };
  }

  async getMember({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    const member = await this.prismaService.member.findFirst({
      where: { userId, workspaceId },
    });

    return member;
  }

  async createMember(member: CreateMember) {
    const validation = CreateMemberObject.safeParse(member);

    if (!validation.success) {
      throw new BadRequestException({
        errors: validation.error.issues,
        statusCode: 400,
      });
    }

    const dbMember = await this.prismaService.member.create({
      data: {
        userId: member.userId,
        workspaceId: member.workspaceId,
        role: member.role,
      },
    });

    return dbMember;
  }

  async deleteMember({
    workspaceId,
    memberId,
    userId,
  }: {
    workspaceId: string;
    memberId: string;
    userId: string;
  }) {
    const member = await this.getMember({ userId, workspaceId });

    if (!member || member.role !== 'ADMIN') {
      throw new UnauthorizedException(
        'You are not authorized to remove this member from the workspace.',
      );
    }

    const deletedMember = await this.prismaService.member.delete({
      where: {
        id: memberId,
      },
    });

    return {
      statusCode: 200,
      member: deletedMember,
    };
  }
}
