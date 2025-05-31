import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembersService } from '../members/members.service';
import {
  CreateWorkspace,
  CreateWorkspaceObject,
} from './types/create-workspace';

@Injectable()
export class WorkspacesService {
  constructor(
    private prismaService: PrismaService,
    private membersService: MembersService
  ) {}

  async createWorkspace(workspace: CreateWorkspace) {
    const validation = CreateWorkspaceObject.safeParse(workspace);

    if (!validation.success) {
      throw new BadRequestException({
        errors: validation.error.issues,
        statusCode: 400,
      });
    }

    const dbWorkspace = await this.prismaService.workspace.create({
      data: {
        name: workspace.name
      }
    })

    await this.membersService.createMember({ userId: workspace.userId, workspaceId: dbWorkspace.id })

    return {
      success: true,
      workspace: dbWorkspace,
      statusCode: 200
    }
  }
}
