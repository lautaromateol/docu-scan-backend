import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly worskpacesService: WorkspacesService) {}

  @UseGuards(AuthGuard)
  @Post()
  @HttpCode(201)
  createWorkspace(@Body() workspace: { name: string }, @Request() request) {
    return this.worskpacesService.createWorkspace({
      ...workspace,
      userId: request.user.id,
    });
  }
}
