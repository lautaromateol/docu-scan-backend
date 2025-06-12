import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateWorkspace } from './types/create-workspace';
import { UpdateWorkspace } from './types/update-workspace';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly worskpacesService: WorkspacesService) {}

  @UseGuards(AuthGuard)
  @Get()
  @HttpCode(200)
  getAllWorkspaces(@Request() request) {
    return this.worskpacesService.getAllWorkspaces(request.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @HttpCode(200)
  getWorkspace(@Param('id') id: string, @Request() request) {
    return this.worskpacesService.getWorkspace({
      workspaceId: id,
      userId: request.user.id,
    });
  }

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(201)
  createWorkspace(@Body() workspace: CreateWorkspace, @Request() request) {
    return this.worskpacesService.createWorkspace({
      workspace,
      userId: request.user.id,
    });
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  @HttpCode(200)
  updateWorkspace(
    @Param('id') id: string,
    @Body() workspace: UpdateWorkspace,
    @Request() request,
  ) {
    return this.worskpacesService.updateWorkspace({
      workspace,
      workspaceId: id,
      userId: request.user.id,
    });
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @HttpCode(200)
  deleteWorkspace(@Param('id') id: string, @Request() request) {
    return this.worskpacesService.deleteWorkspace({
      workspaceId: id,
      userId: request.user.id,
    });
  }

  @UseGuards(AuthGuard)
  @Post('join/:inviteCode')
  @HttpCode(200)
  joinWorkspace(@Param('inviteCode') inviteCode: string, @Request() request) {
    return this.worskpacesService.joinWorkspace({
      inviteCode,
      userId: request.user.id,
    });
  }
}
