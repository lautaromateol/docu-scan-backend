import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { MembersModule } from "../members/members.module";
import { WorkspacesService } from "./workspaces.service";
import { WorkspacesController } from "./workspaces.controller";

@Module({
  imports: [PrismaModule, MembersModule],
  providers: [WorkspacesService],
  controllers: [WorkspacesController]
})
export class WorkspacesModule {}