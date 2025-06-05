import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class WorkspacesService {
  constructor(
    private prismaService: PrismaService,
    private membersService: MembersService,
  ) {}

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

    const member = await this.membersService.getMember(userId);

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
