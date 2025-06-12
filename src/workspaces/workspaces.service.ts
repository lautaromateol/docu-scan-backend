import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembersService } from '../members/members.service';
import {
  CreateWorkspace,
  CreateWorkspaceObject,
} from './types/create-workspace';
import {
  UpdateWorkspace,
  UpdateWorkspaceObject,
} from './types/update-workspace';
import { generateInviteCode } from 'lib/utils';

@Injectable()
export class WorkspacesService {
  constructor(
    private prismaService: PrismaService,
    private membersService: MembersService,
  ) {}

  async getWorkspace({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    const member = await this.membersService.getMember({ userId, workspaceId })

    if(!member) {
      throw new UnauthorizedException()
    }

    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        id: workspaceId
      }
    })

    return {
      success: true,
      workspace,
      statusCode: 200
    }
  }

  async getAllWorkspaces(userId: string) {
    const workspaces = await this.prismaService.workspace.findMany({
      where: {
        Member: {
          some: {
            userId,
          },
        },
      },
    });

    return {
      success: true,
      workspaces,
      statusCode: 200,
    };
  }

  async joinWorkspace({
    userId,
    inviteCode,
  }: {
    userId: string;
    inviteCode: string;
  }) {
    const workspace = await this.prismaService.workspace.findFirst({
      where: {
        inviteCode,
      },
    });

    if (!workspace || workspace.inviteCode !== inviteCode) {
      throw new UnauthorizedException('This invite code is invalid.');
    }

    const member = await this.membersService.getMember({
      userId,
      workspaceId: workspace.id,
    });

    if (member) {
      return {
        success: true,
        statusCode: 200,
        message: 'This user is already a workspace member.',
      };
    }

    await this.membersService.createMember({
      role: 'MEMBER',
      userId,
      workspaceId: workspace.id,
    });

    return {
      success: true,
      statusCode: 200,
    };
  }

  async deleteWorkspace({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    const member = await this.membersService.getMember({ workspaceId, userId });

    if (!member || member.role !== 'ADMIN') {
      throw new UnauthorizedException();
    }

    const deletedWorkspace = await this.prismaService.workspace.delete({
      where: { id: workspaceId },
    });

    return {
      success: true,
      workspace: deletedWorkspace,
      statusCode: 200,
    };
  }

  async updateWorkspace({
    workspace,
    workspaceId,
    userId,
  }: {
    workspace: UpdateWorkspace;
    workspaceId: string;
    userId: string;
  }) {
    const validation = UpdateWorkspaceObject.safeParse(workspace);

    if (!validation.success) {
      throw new BadRequestException({
        errors: validation.error.issues,
        statusCode: 400,
      });
    }

    const member = await this.membersService.getMember({ workspaceId, userId });

    if (!member || member.role !== 'ADMIN') {
      throw new UnauthorizedException();
    }

    const dbWorkspace = await this.prismaService.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        ...workspace,
      },
    });

    return {
      success: true,
      workspace: dbWorkspace,
      statusCode: 200,
    };
  }

  async createWorkspace({
    workspace,
    userId,
  }: {
    userId: string;
    workspace: CreateWorkspace;
  }) {
    const validation = CreateWorkspaceObject.safeParse(workspace);

    if (!validation.success) {
      throw new BadRequestException({
        errors: validation.error.issues,
        statusCode: 400,
      });
    }

    const dbWorkspace = await this.prismaService.workspace.create({
      data: {
        name: workspace.name,
        inviteCode: generateInviteCode(10),
      },
    });

    await this.membersService.createMember({
      userId,
      workspaceId: dbWorkspace.id,
      role: 'ADMIN',
    });

    return {
      success: true,
      workspace: dbWorkspace,
      statusCode: 200,
    };
  }
}
