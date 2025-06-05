import { Body, Controller, Get, HttpCode, Post } from "@nestjs/common";
import { CreateWorkspace } from "./types/create-workspace";
import { WorkspacesService } from "./workspaces.service";

@Controller("workspaces")
export class WorkspacesController {
  constructor(private readonly worskpacesService: WorkspacesService) {}

  @Post()
  @HttpCode(201)
  createWorkspace(@Body() workspace: CreateWorkspace) {
    return this.worskpacesService.createWorkspace(workspace)
  }
}